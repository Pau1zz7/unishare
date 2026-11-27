import polyline from '@mapbox/polyline';
import { geohashQueryBounds } from 'geofire-common';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  limit,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import {
  Coordinates,
  Task,
  Product,
  MapMarkerItem,
} from '../../../types';
import {
  getDistanceInMeters,
  minDistanceToPolylineMeters,
} from './locationService';

export interface CampusPreset {
  id: string;
  name: string;
  address: string;
  coords: Coordinates;
}

export const CAMPUS_PRESETS: CampusPreset[] = [
  {
    id: 'uit',
    name: 'ĐH Công Nghệ Thông Tin (UIT)',
    address: 'Khu phố 6, P. Linh Trung, TP. Thủ Đức',
    coords: { latitude: 10.870008, longitude: 106.803054 },
  },
  {
    id: 'ktx-b',
    name: 'KTX Khu B ĐHQG TP.HCM',
    address: 'Tô Vĩnh Diện, Đông Hòa, Dĩ An',
    coords: { latitude: 10.882274, longitude: 106.782541 },
  },
  {
    id: 'ktx-a',
    name: 'KTX Khu A ĐHQG TP.HCM',
    address: 'Khu phố 6, P. Linh Trung, TP. Thủ Đức',
    coords: { latitude: 10.877796, longitude: 106.806278 },
  },
  {
    id: 'khtn',
    name: 'ĐH Khoa Học Tự Nhiên (Cơ sở 2)',
    address: 'Linh Trung, TP. Thủ Đức',
    coords: { latitude: 10.875845, longitude: 106.799142 },
  },
  {
    id: 'tvtt',
    name: 'Thư viện Trung tâm ĐHQG',
    address: 'Khu đô thị ĐHQG TP.HCM',
    coords: { latitude: 10.877543, longitude: 106.801729 },
  },
  {
    id: 'bk',
    name: 'ĐH Bách Khoa (Cơ sở Dĩ An)',
    address: 'Đông Hòa, Dĩ An, Bình Dương',
    coords: { latitude: 10.880558, longitude: 106.805386 },
  },
];

export interface RoutePolylineResult {
  coordinates: Coordinates[];
  totalDistanceKm: number;
  estimatedDurationMins: number;
  isFallback: boolean;
}

export interface RouteMatchBundle {
  route: RoutePolylineResult;
  matchedTasks: MapMarkerItem[];
  allTaskMarkers: MapMarkerItem[];
  allProductMarkers: MapMarkerItem[];
}

export const fetchRoutePolyline = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<RoutePolylineResult> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=polyline`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('OSRM request failed');
    }

    const data = await response.json();
    const firstRoute = data?.routes?.[0];
    if (!firstRoute?.geometry) {
      throw new Error('No route geometry');
    }

    const decodedPairs = polyline.decode(firstRoute.geometry);
    const coordinates: Coordinates[] = decodedPairs.map(
      ([lat, lng]: [number, number]) => ({
        latitude: lat,
        longitude: lng,
      })
    );

    return {
      coordinates,
      totalDistanceKm: Math.round((firstRoute.distance / 1000) * 10) / 10,
      estimatedDurationMins: Math.max(1, Math.round(firstRoute.duration / 60)),
      isFallback: false,
    };
  } catch {
    clearTimeout(timeoutId);
    const directMeters = getDistanceInMeters(origin, destination);
    return {
      coordinates: [origin, destination],
      totalDistanceKm: Math.round((directMeters / 1000) * 10) / 10,
      estimatedDurationMins: Math.max(1, Math.round(directMeters / 400)),
      isFallback: true,
    };
  }
};

const computeRouteBounds = (
  routeCoords: Coordinates[],
  bufferMeters: number
) => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const pt of routeCoords) {
    if (pt.latitude < minLat) minLat = pt.latitude;
    if (pt.latitude > maxLat) maxLat = pt.latitude;
    if (pt.longitude < minLng) minLng = pt.longitude;
    if (pt.longitude > maxLng) maxLng = pt.longitude;
  }

  const center: Coordinates = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
  };

  const corner: Coordinates = {
    latitude: maxLat,
    longitude: maxLng,
  };

  const radiusInMeters = Math.max(
    500,
    getDistanceInMeters(center, corner) + bufferMeters
  );

  return { center, radiusInMeters };
};

export const queryOpenTasksByGeohash = async (
  routeCoords: Coordinates[],
  maxDeviationMeters = 300
): Promise<Task[]> => {
  const { center, radiusInMeters } = computeRouteBounds(
    routeCoords,
    maxDeviationMeters
  );
  const bounds = geohashQueryBounds(
    [center.latitude, center.longitude],
    radiusInMeters
  );

  const taskMap = new Map<string, Task>();

  try {
    const snapshots = await Promise.all(
      bounds.map((b) => {
        const q = query(
          collection(db, 'tasks'),
          orderBy('pickupLocation.geohash'),
          startAt(b[0]),
          endAt(b[1]),
          limit(50)
        );
        return getDocs(q);
      })
    );

    snapshots.forEach((snap) => {
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data() as Task;
        if (data.status === 'open') {
          taskMap.set(docSnap.id, { ...data, taskId: docSnap.id });
        }
      });
    });
  } catch {
    taskMap.clear();
  }

  if (taskMap.size === 0) {
    const fallbackQuery = query(
      collection(db, 'tasks'),
      where('status', '==', 'open'),
      limit(100)
    );
    const fallbackSnap = await getDocs(fallbackQuery);
    fallbackSnap.docs.forEach((docSnap) => {
      const data = docSnap.data() as Task;
      if (data.pickupLocation?.latitude && data.pickupLocation?.longitude) {
        taskMap.set(docSnap.id, { ...data, taskId: docSnap.id });
      }
    });
  }

  return Array.from(taskMap.values());
};

const queryAvailableProducts = async (): Promise<Product[]> => {
  const q = query(
    collection(db, 'products'),
    where('status', '==', 'available'),
    limit(60)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((docSnap) => ({
      ...(docSnap.data() as Product),
      productId: docSnap.id,
    }))
    .filter((p) => Boolean(p.location?.latitude && p.location?.longitude));
};

export const findRouteMatches = async (
  origin: Coordinates,
  destination: Coordinates,
  maxDeviationMeters = 300
): Promise<RouteMatchBundle> => {
  const route = await fetchRoutePolyline(origin, destination);
  const [openTasks, availableProducts] = await Promise.all([
    queryOpenTasksByGeohash(route.coordinates, maxDeviationMeters),
    queryAvailableProducts(),
  ]);

  const allTaskMarkers: MapMarkerItem[] = openTasks
    .filter((t) => Boolean(t.pickupLocation?.latitude && t.pickupLocation?.longitude))
    .map((task): MapMarkerItem => {
      const deviationMeters = minDistanceToPolylineMeters(
        {
          latitude: task.pickupLocation.latitude,
          longitude: task.pickupLocation.longitude,
        },
        route.coordinates
      );
      return {
        id: task.taskId,
        type: 'task',
        title: task.title,
        bountyOrPrice: task.bounty,
        category: task.category,
        requesterOrSellerName: task.requesterName,
        trustScore: task.requesterTrustScore,
        address: task.pickupLocation.address,
        deviationMeters,
        latitude: task.pickupLocation.latitude,
        longitude: task.pickupLocation.longitude,
        rawTask: task,
      };
    })
    .sort((a, b) => (a.deviationMeters ?? Infinity) - (b.deviationMeters ?? Infinity));

  const matchedTasks = allTaskMarkers.filter(
    (item) => (item.deviationMeters ?? Infinity) <= maxDeviationMeters
  );

  const allProductMarkers: MapMarkerItem[] = availableProducts
    .map((product): MapMarkerItem => {
      const deviationMeters = minDistanceToPolylineMeters(
        {
          latitude: product.location.latitude,
          longitude: product.location.longitude,
        },
        route.coordinates
      );
      return {
        id: product.productId,
        type: 'product',
        title: product.title,
        bountyOrPrice: product.price,
        isFree: product.isFree,
        category: product.category,
        requesterOrSellerName: product.sellerName,
        trustScore: product.sellerTrustScore,
        address: product.location.address,
        deviationMeters,
        latitude: product.location.latitude,
        longitude: product.location.longitude,
        rawProduct: product,
      };
    })
    .sort((a, b) => (a.deviationMeters ?? Infinity) - (b.deviationMeters ?? Infinity));

  return {
    route,
    matchedTasks,
    allTaskMarkers,
    allProductMarkers,
  };
};
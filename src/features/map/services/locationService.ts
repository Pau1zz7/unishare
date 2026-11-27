import * as Location from 'expo-location';
import { geohashForLocation } from 'geofire-common';
import { Coordinates } from '../../../types';

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (deg: number): number => (deg * Math.PI) / 180;

export const getCurrentLocation = async (): Promise<Coordinates | null> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const current = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: current.coords.latitude,
    longitude: current.coords.longitude,
  };
};

export const generateGeohash = (
  latitude: number,
  longitude: number
): string => {
  return geohashForLocation([latitude, longitude]);
};

export const getDistanceInMeters = (
  c1: Coordinates,
  c2: Coordinates
): number => {
  const dLat = toRadians(c2.latitude - c1.latitude);
  const dLng = toRadians(c2.longitude - c1.longitude);
  const lat1 = toRadians(c1.latitude);
  const lat2 = toRadians(c2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};

export const pointToSegmentDistanceMeters = (
  point: Coordinates,
  segStart: Coordinates,
  segEnd: Coordinates
): number => {
  const cosLat = Math.cos(toRadians(point.latitude));
  const metersPerDegLat = 110540;
  const metersPerDegLng = 111320 * cosLat;

  const px = (point.longitude - segStart.longitude) * metersPerDegLng;
  const py = (point.latitude - segStart.latitude) * metersPerDegLat;
  const bx = (segEnd.longitude - segStart.longitude) * metersPerDegLng;
  const by = (segEnd.latitude - segStart.latitude) * metersPerDegLat;

  const segLengthSq = bx * bx + by * by;
  if (segLengthSq === 0) {
    return Math.hypot(px, py);
  }

  const rawT = (px * bx + py * by) / segLengthSq;
  const t = Math.max(0, Math.min(1, rawT));

  const closestX = t * bx;
  const closestY = t * by;

  return Math.hypot(px - closestX, py - closestY);
};

export const minDistanceToPolylineMeters = (
  point: Coordinates,
  polylineCoords: Coordinates[]
): number => {
  if (polylineCoords.length === 0) {
    return Infinity;
  }
  if (polylineCoords.length === 1) {
    return getDistanceInMeters(point, polylineCoords[0]);
  }

  let minDist = Infinity;
  for (let i = 0; i < polylineCoords.length - 1; i++) {
    const dist = pointToSegmentDistanceMeters(
      point,
      polylineCoords[i],
      polylineCoords[i + 1]
    );
    if (dist < minDist) {
      minDist = dist;
    }
  }
  return Math.round(minDist);
};
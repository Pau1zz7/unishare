import { geohashForLocation, distanceBetween } from 'geofire-common';
import { LocationPoint } from '../../types';

export interface CampusPreset {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
}

export const DEFAULT_CAMPUS_COORDS = {
  latitude: 10.8805,
  longitude: 106.7825,
};

export const CAMPUS_PICKUP_PRESETS: CampusPreset[] = [
  {
    id: 'ktx_b_gate1',
    address: 'Cổng 1 KTX Khu B ĐHQG',
    latitude: 10.8822,
    longitude: 106.7815,
  },
  {
    id: 'ktx_a_gate',
    address: 'Cổng KTX Khu A ĐHQG',
    latitude: 10.8781,
    longitude: 106.8062,
  },
  {
    id: 'khtn_photo',
    address: 'Quán Photo Cổng ĐH KHTN',
    latitude: 10.8753,
    longitude: 106.7991,
  },
  {
    id: 'uit_canteen',
    address: 'Căng tin ĐH CNTT (UIT)',
    latitude: 10.8701,
    longitude: 106.8031,
  },
];

export const CAMPUS_DELIVERY_PRESETS: CampusPreset[] = [
  {
    id: 'ktx_b_b3',
    address: 'Sảnh Tòa B3 KTX Khu B',
    latitude: 10.8812,
    longitude: 106.7828,
  },
  {
    id: 'ktx_b_ba4',
    address: 'Sảnh Tòa BA4 KTX Khu B',
    latitude: 10.8804,
    longitude: 106.7819,
  },
  {
    id: 'ktx_a_a12',
    address: 'Sảnh Tòa A12 KTX Khu A',
    latitude: 10.8775,
    longitude: 106.8054,
  },
  {
    id: 'bk_parking',
    address: 'Nhà xe Trường ĐH Bách Khoa',
    latitude: 10.8806,
    longitude: 106.8055,
  },
];

export const CAMPUS_PRODUCT_PRESETS: CampusPreset[] = [
  {
    id: 'ktx_b',
    address: 'KTX Khu B ĐHQG TP.HCM',
    latitude: 10.8815,
    longitude: 106.7822,
  },
  {
    id: 'ktx_a',
    address: 'KTX Khu A ĐHQG TP.HCM',
    latitude: 10.8779,
    longitude: 106.8058,
  },
  {
    id: 'uit',
    address: 'Trường ĐH Công Nghệ Thông Tin (UIT)',
    latitude: 10.8701,
    longitude: 106.8031,
  },
  {
    id: 'khtn',
    address: 'Trường ĐH Khoa Học Tự Nhiên',
    latitude: 10.8756,
    longitude: 106.7993,
  },
];

/**
 * Sinh chuỗi geohash từ tọa độ (latitude, longitude) bằng geofire-common.
 */
export const generateGeohash = (latitude: number, longitude: number): string => {
  return geohashForLocation([latitude, longitude]);
};

/**
 * Gắn trường geohash vào LocationPoint dựa trên latitude & longitude.
 */
export const enrichLocationWithGeohash = (location: LocationPoint): LocationPoint => {
  const latitude = Number.isFinite(location.latitude)
    ? location.latitude
    : DEFAULT_CAMPUS_COORDS.latitude;
  const longitude = Number.isFinite(location.longitude)
    ? location.longitude
    : DEFAULT_CAMPUS_COORDS.longitude;

  return {
    latitude,
    longitude,
    geohash: generateGeohash(latitude, longitude),
    address: location.address.trim(),
  };
};

/**
 * Tính khoảng cách giữa 2 tọa độ theo km (làm tròn 1 chữ số thập phân).
 */
export const calculateDistanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const km = distanceBetween([lat1, lng1], [lat2, lng2]);
  return Math.round(km * 10) / 10;
};

import { ValidationError } from '../types';

export const validateCoordinates = (latitude: string, longitude: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  if (isNaN(lat)) {
    errors.push({ field: 'latitude', message: 'Latitude must be a valid number' });
  } else if (lat < -90 || lat > 90) {
    errors.push({ field: 'latitude', message: 'Latitude must be between -90 and 90' });
  }
  
  if (isNaN(lon)) {
    errors.push({ field: 'longitude', message: 'Longitude must be a valid number' });
  } else if (lon < -180 || lon > 180) {
    errors.push({ field: 'longitude', message: 'Longitude must be between -180 and 180' });
  }
  
  return errors;
};

export const formatCoordinate = (value: number, type: 'lat' | 'lon'): string => {
  const direction = type === 'lat' 
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(6)}° ${direction}`;
};
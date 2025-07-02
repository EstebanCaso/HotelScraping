export interface Event {
  id?: string;
  nombre: string;
  fecha: string;
  lugar: string;
  enlace?: string;
  distancia?: number;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface HotelCoordinates {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Database event type for mapping between database and application
export interface DatabaseEvent {
  id?: string;
  name?: string;
  location?: string;
  date?: string;
  nombre?: string;
  lugar?: string;
  fecha?: string;
  enlace?: string;
  distance?: number;
  distancia?: number;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

// Progress tracking for scraping operations
export interface ScrapingProgress {
  stage: 'scraping' | 'geocoding' | 'filtering' | 'saving' | 'complete';
  message: string;
  progress: number; // 0-100
  details?: string;
}
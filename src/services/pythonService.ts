import { HotelCoordinates, Event } from '../types';
import { saveEvents } from './eventService';

export interface ScrapingProgress {
  stage: 'scraping' | 'geocoding' | 'filtering' | 'saving' | 'complete';
  message: string;
  progress: number; // 0-100
  details?: string;
}

// Ejecutar el scraper Python real vía FastAPI
export const runPythonScraper = async (
  coordinates: HotelCoordinates,
  onProgress?: (progress: ScrapingProgress) => void
): Promise<Event[]> => {
  // Simulación de progreso suave
  let currentStage: ScrapingProgress['stage'] = 'scraping';
  let progress = 10;
  let interval: NodeJS.Timeout | null = null;
  let running = true;

  const stageMap: { stage: ScrapingProgress['stage']; start: number; end: number; message: string; details: string }[] = [
    { stage: 'scraping', start: 0, end: 70, message: 'Extrayendo eventos desde Eventbrite...', details: 'El backend está navegando y recolectando eventos.' },
    { stage: 'geocoding', start: 70, end: 90, message: 'Geocodificando ubicaciones de venues...', details: 'Geocodificando ubicaciones de eventos.' },
    { stage: 'filtering', start: 90, end: 95, message: 'Filtrando eventos cercanos al hotel...', details: 'Filtrando eventos por distancia.' },
    { stage: 'saving', start: 95, end: 100, message: 'Guardando eventos en la base de datos...', details: 'Guardando resultados.' }
  ];

  const startStage = (index: number) => {
    const { stage, start, end, message, details } = stageMap[index];
    currentStage = stage;
    progress = start;
    onProgress?.({ stage, message, progress, details });
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      if (!running) return;
      if (progress < end) {
        progress += 1;
        onProgress?.({ stage, message, progress, details });
      }
    }, 1500);
  };

  // Iniciar la simulación de la primera etapa
  startStage(0);

  try {
    // Llamar al backend FastAPI
    const response = await fetch('http://localhost:8000/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        hotel_name: coordinates.name || '',
        radius_km: 20
      })
    });

    running = false;
    if (interval) clearInterval(interval);

    if (!response.ok) {
      throw new Error('Error en el backend Python');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error desconocido en el backend Python');
    }

    // Simular avance rápido por las etapas restantes
    for (let i = 1; i < stageMap.length; i++) {
      startStage(i);
      await new Promise(res => setTimeout(res, 600));
      running = false;
      if (interval) clearInterval(interval);
    }

    // Etapa 5: Completado
    onProgress?.({
      stage: 'complete',
      message: `Análisis completado: ${result.nearby_events_count} eventos encontrados`,
      progress: 100,
      details: 'Eventos guardados y listos para análisis de pricing.'
    });

    await saveEvents(result.nearby_events);

    return result.nearby_events;
  } catch (error) {
    running = false;
    if (interval) clearInterval(interval);
    console.error('Error ejecutando el scraper Python:', error);
    throw new Error('Error al buscar eventos. Por favor intente nuevamente.');
  }
};
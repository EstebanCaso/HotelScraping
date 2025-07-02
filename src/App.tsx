import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CoordinateForm } from './components/CoordinateForm';
import { EventsTable } from './components/EventsTable';
import { ProgressIndicator } from './components/ProgressIndicator';
import { HotelCoordinates, Event } from './types';
import { runPythonScraper, ScrapingProgress } from './services/pythonService';
import { fetchEvents } from './services/eventService';
import HotelPriceComparison from './components/HotelPriceComparison';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [hotelCoordinates, setHotelCoordinates] = useState<HotelCoordinates | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [scrapingProgress, setScrapingProgress] = useState<ScrapingProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'eventos' | 'hoteles'>('eventos');

  // Cargar eventos existentes al montar el componente
  useEffect(() => {
    const loadExistingEvents = async () => {
      try {
        const existingEvents = await fetchEvents();
        if (existingEvents.length > 0) {
          setEvents(existingEvents);
          console.log(`📊 Cargados ${existingEvents.length} eventos desde la base de datos`);
        }
      } catch (err) {
        console.error('Error cargando eventos existentes:', err);
        // Si la base de datos falla, no cargar nada más
      }
    };

    loadExistingEvents();
  }, []);

  const handleCoordinateSubmit = async (coordinates: HotelCoordinates) => {
    setLoading(true);
    setError(null);
    setHotelCoordinates(coordinates);
    setScrapingProgress(null);

    try {
      console.log('🏨 Iniciando análisis para:', coordinates.name || 'Hotel');
      console.log('📍 Coordenadas:', coordinates.latitude, coordinates.longitude);
      
      // Ejecutar el scraper Python con callback de progreso
      const scrapedEvents = await runPythonScraper(coordinates, (progress) => {
        setScrapingProgress(progress);
        console.log(`📊 ${progress.stage}: ${progress.message} (${progress.progress}%)`);
      });
      
      setEvents(scrapedEvents);
      console.log('✅ Análisis completado. Eventos encontrados:', scrapedEvents.length);
      
      // Limpiar progreso después de un breve delay para mostrar completado
      setTimeout(() => {
        setScrapingProgress(null);
      }, 2000);
      
    } catch (err) {
      setError('Error al buscar eventos. Por favor intente nuevamente.');
      console.error('Error en el scraping:', err);
      setScrapingProgress(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'eventos' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-200'}`}
            onClick={() => setActiveTab('eventos')}
          >
            Eventos Cercanos
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'hoteles' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-200'}`}
            onClick={() => setActiveTab('hoteles')}
          >
            Comparar Precios de Hoteles
          </button>
        </div>
        {activeTab === 'eventos' && (
          <div className="space-y-8">
            <CoordinateForm 
              onSubmit={handleCoordinateSubmit} 
              loading={loading}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Mostrar indicador de progreso durante el scraping */}
            {scrapingProgress && (
              <ProgressIndicator progress={scrapingProgress} />
            )}

            {/* Mostrar tabla de eventos solo si no está en progreso */}
            {!scrapingProgress && (
              <EventsTable 
                events={events} 
                loading={loading && !scrapingProgress}
                hotelCoordinates={hotelCoordinates}
              />
            )}
          </div>
        )}
        {activeTab === 'hoteles' && (
          <HotelPriceComparison />
        )}
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              Sistema de Revenue Management • Datos de Eventbrite • Optimización automática de precios
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Desarrollado para maximizar ingresos hoteleros basado en eventos cercanos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
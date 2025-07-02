import React, { useState } from 'react';
import { MapPin, Search, AlertCircle, Hotel } from 'lucide-react';
import { HotelCoordinates, ValidationError } from '../types';
import { validateCoordinates } from '../utils/validation';

interface CoordinateFormProps {
  onSubmit: (coordinates: HotelCoordinates) => void;
  loading: boolean;
}

export const CoordinateForm: React.FC<CoordinateFormProps> = ({ onSubmit, loading }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateCoordinates(latitude, longitude);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      onSubmit({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        name: hotelName || undefined
      });
    }
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const fillSampleCoordinates = () => {
    setLatitude('32.5149');
    setLongitude('-117.0382');
    setHotelName('Hotel Tijuana Centro');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Hotel className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ubicación del Hotel</h2>
          <p className="text-gray-600">Ingresa las coordenadas para encontrar eventos cercanos y optimizar precios</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="hotelName" className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre del Hotel
          </label>
          <input
            type="text"
            id="hotelName"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="ej. Hotel Tijuana Centro"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-semibold text-gray-700 mb-2">
              Latitud *
            </label>
            <input
              type="text"
              id="latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                getFieldError('latitude') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="32.5149"
              required
            />
            {getFieldError('latitude') && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {getFieldError('latitude')}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="longitude" className="block text-sm font-semibold text-gray-700 mb-2">
              Longitud *
            </label>
            <input
              type="text"
              id="longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                getFieldError('longitude') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="-117.0382"
              required
            />
            {getFieldError('longitude') && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {getFieldError('longitude')}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analizando eventos...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Buscar Eventos y Analizar Precios
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={fillSampleCoordinates}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Usar Ejemplo
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Estrategia de Revenue Management</h4>
          <p className="text-sm text-blue-800 mb-2">
            <strong>Cómo funciona:</strong> El sistema busca eventos en Eventbrite cerca de tu hotel y calcula distancias para sugerir ajustes de precios.
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>≤2km:</strong> Incremento alto (+25-40%) - Eventos muy cercanos</li>
            <li>• <strong>2-5km:</strong> Incremento medio (+15-25%) - Eventos cercanos</li>
            <li>• <strong>5-10km:</strong> Incremento bajo (+5-15%) - Eventos moderados</li>
            <li>• <strong>&gt;10km:</strong> Sin incremento - Eventos lejanos</li>
          </ul>
        </div>
      </form>
    </div>
  );
};
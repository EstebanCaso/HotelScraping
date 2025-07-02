import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, ExternalLink, Search, Filter, SortAsc, SortDesc, TrendingUp, DollarSign } from 'lucide-react';
import { Event } from '../types';
import { formatCoordinate } from '../utils/validation';

interface EventsTableProps {
  events: Event[];
  loading: boolean;
  hotelCoordinates?: { latitude: number; longitude: number; name?: string };
}

type SortField = 'nombre' | 'fecha' | 'lugar' | 'distancia';
type SortDirection = 'asc' | 'desc';

export const EventsTable: React.FC<EventsTableProps> = ({ events, loading, hotelCoordinates }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterDistance, setFilterDistance] = useState<number>(20);

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.lugar.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDistance = !event.distancia || event.distancia <= filterDistance;
      return matchesSearch && matchesDistance;
    });

    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'nombre':
          aValue = a.nombre;
          bValue = b.nombre;
          break;
        case 'fecha':
          aValue = a.fecha;
          bValue = b.fecha;
          break;
        case 'lugar':
          aValue = a.lugar;
          bValue = b.lugar;
          break;
        case 'distancia':
          aValue = a.distancia || 0;
          bValue = b.distancia || 0;
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [events, searchTerm, sortField, sortDirection, filterDistance]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  const getPricingRecommendation = (distance: number | undefined, eventName: string): string => {
    if (!distance) return 'Sin datos';
    
    if (distance <= 2) {
      return 'Incremento Alto (+25-40%)';
    } else if (distance <= 5) {
      return 'Incremento Medio (+15-25%)';
    } else if (distance <= 10) {
      return 'Incremento Bajo (+5-15%)';
    } else {
      return 'Sin incremento';
    }
  };

  const getPricingColor = (distance: number | undefined): string => {
    if (!distance) return 'bg-gray-100 text-gray-800';
    
    if (distance <= 2) {
      return 'bg-red-100 text-red-800';
    } else if (distance <= 5) {
      return 'bg-orange-100 text-orange-800';
    } else if (distance <= 10) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Buscando eventos cercanos al hotel...</p>
            <p className="text-sm text-gray-500 mt-2">Analizando Eventbrite y calculando distancias</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-blue-600" />
              Eventos Cercanos - Oportunidades de Pricing
            </h2>
            <p className="text-gray-600">
              {events.length} eventos encontrados
              {hotelCoordinates && (
                <span className="ml-2">
                  cerca del hotel {hotelCoordinates.name || ''} 
                  ({formatCoordinate(hotelCoordinates.latitude, 'lat')}, {formatCoordinate(hotelCoordinates.longitude, 'lon')})
                </span>
              )}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">Estrategia de Precios</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Ajusta tarifas según proximidad de eventos
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar eventos o lugares..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterDistance}
              onChange={(e) => setFilterDistance(Number(e.target.value))}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value={5}>Dentro de 5km</option>
              <option value={10}>Dentro de 10km</option>
              <option value={20}>Dentro de 20km</option>
              <option value={50}>Dentro de 50km</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAndSortedEvents.length === 0 ? (
        <div className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron eventos</h3>
          <p className="text-gray-600">
            {events.length === 0 
              ? "Ingresa las coordenadas del hotel arriba para comenzar a buscar eventos cercanos."
              : "Intenta ajustar los criterios de búsqueda o el filtro de distancia."
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('nombre')}
                >
                  <div className="flex items-center gap-2">
                    Evento
                    <SortIcon field="nombre" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('fecha')}
                >
                  <div className="flex items-center gap-2">
                    Fecha y Hora
                    <SortIcon field="fecha" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('lugar')}
                >
                  <div className="flex items-center gap-2">
                    Lugar
                    <SortIcon field="lugar" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort('distancia')}
                >
                  <div className="flex items-center gap-2">
                    Distancia
                    <SortIcon field="distancia" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Recomendación de Precio
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedEvents.map((event, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{event.nombre}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{event.fecha}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {event.lugar}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {event.distancia ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {event.distancia.toFixed(1)} km
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPricingColor(event.distancia)}`}>
                      {getPricingRecommendation(event.distancia, event.nombre)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {event.enlace && (
                      <a
                        href={event.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver Evento
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAndSortedEvents.length > 0 && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-red-100 rounded-lg p-4">
              <div className="text-red-800 font-semibold">Eventos Muy Cercanos (≤2km)</div>
              <div className="text-red-600 text-sm">Incremento Alto: +25-40%</div>
              <div className="text-red-800 font-bold text-lg">
                {filteredAndSortedEvents.filter(e => e.distancia && e.distancia <= 2).length}
              </div>
            </div>
            <div className="bg-orange-100 rounded-lg p-4">
              <div className="text-orange-800 font-semibold">Eventos Cercanos (2-5km)</div>
              <div className="text-orange-600 text-sm">Incremento Medio: +15-25%</div>
              <div className="text-orange-800 font-bold text-lg">
                {filteredAndSortedEvents.filter(e => e.distancia && e.distancia > 2 && e.distancia <= 5).length}
              </div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4">
              <div className="text-yellow-800 font-semibold">Eventos Moderados (5-10km)</div>
              <div className="text-yellow-600 text-sm">Incremento Bajo: +5-15%</div>
              <div className="text-yellow-800 font-bold text-lg">
                {filteredAndSortedEvents.filter(e => e.distancia && e.distancia > 5 && e.distancia <= 10).length}
              </div>
            </div>
            <div className="bg-green-100 rounded-lg p-4">
              <div className="text-green-800 font-semibold">Eventos Lejanos (&gt;10km)</div>
              <div className="text-green-600 text-sm">Sin incremento</div>
              <div className="text-green-800 font-bold text-lg">
                {filteredAndSortedEvents.filter(e => e.distancia && e.distancia > 10).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
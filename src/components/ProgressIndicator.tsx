import React from 'react';
import { CheckCircle, Clock, Search, MapPin, Filter, Database } from 'lucide-react';
import { ScrapingProgress } from '../services/pythonService';

interface ProgressIndicatorProps {
  progress: ScrapingProgress;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress }) => {
  const getStageIcon = (stage: string, isActive: boolean, isComplete: boolean) => {
    const iconClass = `w-5 h-5 ${
      isComplete ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400'
    }`;

    switch (stage) {
      case 'scraping':
        return <Search className={iconClass} />;
      case 'geocoding':
        return <MapPin className={iconClass} />;
      case 'filtering':
        return <Filter className={iconClass} />;
      case 'saving':
        return <Database className={iconClass} />;
      case 'complete':
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const stages = [
    { key: 'scraping', label: 'Scraping Eventbrite' },
    { key: 'geocoding', label: 'Geocodificando Venues' },
    { key: 'filtering', label: 'Filtrando por Distancia' },
    { key: 'saving', label: 'Guardando Resultados' },
    { key: 'complete', label: 'Completado' }
  ];

  const currentStageIndex = stages.findIndex(stage => stage.key === progress.stage);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Analizando Eventos Cercanos</h3>
        <p className="text-gray-600">{progress.message}</p>
        {progress.details && (
          <p className="text-sm text-gray-500 mt-1">{progress.details}</p>
        )}
      </div>

      {/* Barra de progreso principal */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso</span>
          <span>{progress.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* Indicadores de etapas */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isActive = stage.key === progress.stage;
          const isComplete = index < currentStageIndex || progress.stage === 'complete';
          
          return (
            <div 
              key={stage.key}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                isActive ? 'bg-blue-50 border border-blue-200' : 
                isComplete ? 'bg-green-50 border border-green-200' : 
                'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-full ${
                isComplete ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {getStageIcon(stage.key, isActive, isComplete)}
              </div>
              
              <div className="flex-1">
                <div className={`font-medium ${
                  isComplete ? 'text-green-800' : isActive ? 'text-blue-800' : 'text-gray-600'
                }`}>
                  {stage.label}
                </div>
                
                {isActive && progress.details && (
                  <div className="text-sm text-blue-600 mt-1">
                    {progress.details}
                  </div>
                )}
                
                {isComplete && stage.key !== 'complete' && (
                  <div className="text-sm text-green-600 mt-1">
                    ✓ Completado
                  </div>
                )}
              </div>

              {isActive && (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
              
              {isComplete && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
          );
        })}
      </div>

      {progress.stage === 'complete' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Análisis Completado</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Los eventos han sido analizados y están listos para optimización de precios.
          </p>
        </div>
      )}
    </div>
  );
};
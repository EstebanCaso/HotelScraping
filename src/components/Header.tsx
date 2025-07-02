import React from 'react';
import { Hotel, TrendingUp, Calendar } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Hotel className="w-8 h-8" />
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Hotel Revenue Optimizer</h1>
            <p className="text-blue-100 text-lg">
              Sistema inteligente de pricing basado en eventos cercanos en Tijuana
            </p>
            <p className="text-blue-200 text-sm mt-1">
              Maximiza ingresos ajustando tarifas según la proximidad de eventos musicales
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
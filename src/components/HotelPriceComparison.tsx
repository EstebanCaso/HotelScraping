// Componente de comparación de precios de hoteles
// Permite buscar hoteles y mostrar resultados en tabla y gráficos
// La lógica de scraping real debe implementarse en el backend Python (ver python/scrape_hotels.py)

import React, { useState } from 'react';
// Si usas Chart.js:
// import { Bar } from 'react-chartjs-2';

interface HotelPrice {
  nombre: string;
  precio: number;
  url: string;
}

const HotelPriceComparison: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<HotelPrice[]>([]);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implementar fetch real al backend Python para scraping de precios
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setHotels([]);
    try {
      // Aquí deberías hacer un fetch al backend Python
      // const response = await fetch('http://localhost:8000/scrape-hotels', { ... });
      // const data = await response.json();
      // setHotels(data.hotels);

      // Ejemplo de datos simulados:
      setTimeout(() => {
        setHotels([
          { nombre: 'Hotel Real del Mar', precio: 1800, url: 'https://hotel1.com' },
          { nombre: 'Hotel Lucerna', precio: 2200, url: 'https://hotel2.com' },
          { nombre: 'Hotel Tijuana', precio: 1500, url: 'https://hotel3.com' }
        ]);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Error al buscar precios de hoteles.');
      setLoading(false);
    }
  };

  // Ejemplo de datos para gráfico
  const chartData = {
    labels: hotels.map(h => h.nombre),
    datasets: [
      {
        label: 'Precio por noche (MXN)',
        data: hotels.map(h => h.precio),
        backgroundColor: 'rgba(59, 130, 246, 0.7)'
      }
    ]
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-4">Comparar Precios de Hoteles</h2>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="border rounded-lg px-4 py-2 flex-1"
          placeholder="Buscar hoteles o ciudad..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={handleSearch}
          disabled={loading}
        >
          Buscar
        </button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div className="text-blue-600 mb-4">Buscando precios de hoteles...</div>}
      {hotels.length > 0 && (
        <>
          <table className="w-full mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Hotel</th>
                <th className="py-2 px-4 text-left">Precio</th>
                <th className="py-2 px-4 text-left">Enlace</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map(hotel => (
                <tr key={hotel.nombre}>
                  <td className="py-2 px-4">{hotel.nombre}</td>
                  <td className="py-2 px-4">${hotel.precio}</td>
                  <td className="py-2 px-4">
                    <a href={hotel.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Ejemplo de gráfico de barras (descomenta si usas Chart.js) */}
          {/*
          <Bar data={chartData} options={{
            responsive: true,
            plugins: { legend: { display: false } }
          }} />
          */}
        </>
      )}
    </div>
  );
};

export default HotelPriceComparison; 
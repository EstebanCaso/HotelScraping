#!/usr/bin/env python3
"""
API wrapper para el scraper de eventos
Permite ejecutar el scraping desde la aplicación web
"""

import json
import sys
import os
from typing import Dict, List, Tuple, Optional
from Scrapeo_geo import scrape_eventos, geocode_nominatim, filtrar_eventos_cercanos
from geopy.distance import geodesic
import time

class EventScraperAPI:
    def __init__(self):
        self.cache_file = 'geocode_cache.json'
        self.events_file = 'eventos_scrapeados.json'
        self.nearby_events_file = 'eventos_cercanos.json'
        
    def load_geocode_cache(self) -> Dict:
        """Cargar caché de geocodificación"""
        try:
            if os.path.exists(self.cache_file) and os.path.getsize(self.cache_file) > 0:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            pass
        return {}
    
    def save_geocode_cache(self, cache: Dict):
        """Guardar caché de geocodificación"""
        with open(self.cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    
    def scrape_events(self) -> List[Dict]:
        """Ejecutar scraping de eventos"""
        print("🔍 Iniciando scraping de eventos desde Eventbrite...")
        scrape_eventos()
        
        # Cargar eventos scrapeados
        if os.path.exists(self.events_file):
            with open(self.events_file, 'r', encoding='utf-8') as f:
                events = json.load(f)
            print(f"✅ Scraping completado. {len(events)} eventos encontrados.")
            return events
        else:
            print("❌ Error: No se pudo crear el archivo de eventos.")
            return []
    
    def geocode_venues(self, events: List[Dict]) -> Dict:
        """Geocodificar venues de eventos usando caché"""
        print("📍 Iniciando geocodificación de venues...")
        
        # Cargar caché existente
        coords_por_lugar = self.load_geocode_cache()
        
        # Obtener lugares únicos
        lugares_unicos = set(event['lugar'] for event in events if event.get('lugar'))
        print(f"Encontrados {len(lugares_unicos)} lugares únicos.")
        
        # Geocodificar lugares no cacheados
        nuevos_geocodificados = 0
        for lugar in lugares_unicos:
            if lugar not in coords_por_lugar:
                print(f"Geocodificando: {lugar}")
                coords = geocode_nominatim(lugar, coords_por_lugar)
                if coords:
                    nuevos_geocodificados += 1
                time.sleep(1)  # Rate limiting para Nominatim
            else:
                print(f"Usando caché para: {lugar}")
        
        # Guardar caché actualizado
        self.save_geocode_cache(coords_por_lugar)
        print(f"✅ Geocodificación completada. {nuevos_geocodificados} nuevos lugares geocodificados.")
        
        return coords_por_lugar
    
    def filter_nearby_events(self, events: List[Dict], hotel_coords: Tuple[float, float], 
                           coords_por_lugar: Dict, radius_km: float = 20) -> List[Dict]:
        """Filtrar eventos cercanos al hotel"""
        print(f"🎯 Filtrando eventos dentro de {radius_km}km del hotel...")
        
        nearby_events = []
        for event in events:
            lugar = event.get('lugar')
            coords = coords_por_lugar.get(lugar)
            
            if coords:
                distancia = geodesic(hotel_coords, coords).km
                print(f"{event['nombre']} está a {distancia:.2f} km")
                
                if distancia <= radius_km:
                    event_copy = event.copy()
                    event_copy['distancia'] = round(distancia, 2)
                    event_copy['latitude'] = coords[0]
                    event_copy['longitude'] = coords[1]
                    nearby_events.append(event_copy)
            else:
                print(f"No se pudo geocodificar: {lugar}")
        
        # Ordenar por distancia
        nearby_events.sort(key=lambda x: x.get('distancia', float('inf')))
        
        # Guardar eventos cercanos
        with open(self.nearby_events_file, 'w', encoding='utf-8') as f:
            json.dump(nearby_events, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Filtrado completado. {len(nearby_events)} eventos cercanos encontrados.")
        return nearby_events
    
    def run_full_analysis(self, hotel_lat: float, hotel_lon: float, 
                         hotel_name: str = None, radius_km: float = 20) -> Dict:
        """Ejecutar análisis completo"""
        try:
            hotel_coords = (hotel_lat, hotel_lon)
            
            # Paso 1: Scraping
            events = self.scrape_events()
            if not events:
                return {"error": "No se pudieron obtener eventos"}
            
            # Paso 2: Geocodificación
            coords_por_lugar = self.geocode_venues(events)
            
            # Paso 3: Filtrado
            nearby_events = self.filter_nearby_events(events, hotel_coords, coords_por_lugar, radius_km)
            
            # Resultado final
            result = {
                "success": True,
                "hotel_name": hotel_name,
                "hotel_coordinates": {"latitude": hotel_lat, "longitude": hotel_lon},
                "total_events_scraped": len(events),
                "nearby_events_count": len(nearby_events),
                "nearby_events": nearby_events,
                "radius_km": radius_km
            }
            
            print(f"🎉 Análisis completado exitosamente!")
            print(f"📊 Eventos totales: {len(events)}")
            print(f"📍 Eventos cercanos: {len(nearby_events)}")
            
            return result
            
        except Exception as e:
            error_msg = f"Error durante el análisis: {str(e)}"
            print(f"❌ {error_msg}")
            return {"error": error_msg}

def main():
    """Función principal para uso desde línea de comandos"""
    if len(sys.argv) < 3:
        print("Uso: python scraper_api.py <latitud> <longitud> [nombre_hotel] [radio_km]")
        sys.exit(1)
    
    try:
        lat = float(sys.argv[1])
        lon = float(sys.argv[2])
        hotel_name = sys.argv[3] if len(sys.argv) > 3 else None
        radius = float(sys.argv[4]) if len(sys.argv) > 4 else 20.0
        
        scraper = EventScraperAPI()
        result = scraper.run_full_analysis(lat, lon, hotel_name, radius)
        
        # Imprimir resultado como JSON para que pueda ser leído por la aplicación web
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except ValueError:
        print("Error: Las coordenadas deben ser números válidos")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
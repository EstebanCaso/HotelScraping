import json
import requests
from geopy.distance import geodesic
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import os

def pedir_ubicacion_manual():
    while True:
        entrada = input("Ingresa tu ubicación actual en formato 'latitud,longitud' (ejemplo: 32.5149,-117.0382): ")
        try:
            lat, lon = map(float, entrada.split(','))
            return (lat, lon)
        except:
            print("Formato inválido, intenta de nuevo.")

def geocode_nominatim(address, cache):
    if address in cache:
        return cache[address]

    query = f"{address}, Tijuana, Baja California, México"
    url = 'https://nominatim.openstreetmap.org/search'
    params = {
        'q': query,
        'format': 'json',
        'limit': 1,
        'countrycodes': 'mx'
    }
    headers = {
        'User-Agent': 'MiScriptGeocodificador/1.0 (contacto@tucorreo.com)'
    }
    response = requests.get(url, params=params, headers=headers)
    if response.status_code == 200:
        results = response.json()
        if results:
            coords = (float(results[0]['lat']), float(results[0]['lon']))
            cache[address] = coords
            return coords

    cache[address] = None
    return None

def scrape_eventos():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    service = Service()

    driver = webdriver.Chrome(service=service, options=chrome_options)

    url = "https://www.eventbrite.com/d/mexico--tijuana/events/?q=musica"
    driver.get(url)
    time.sleep(5)

    csv_filename = 'eventos_scrapeados.csv'

    if os.path.exists(csv_filename) and os.path.getsize(csv_filename) > 0:
        try:
            df_existente = pd.read_csv(csv_filename)
        except pd.errors.EmptyDataError:
            df_existente = pd.DataFrame({'nombre': pd.Series(dtype='str'),
                                         'fecha': pd.Series(dtype='str'),
                                         'lugar': pd.Series(dtype='str'),
                                         'enlace': pd.Series(dtype='str')})
    else:
        df_existente = pd.DataFrame({'nombre': pd.Series(dtype='str'),
                                     'fecha': pd.Series(dtype='str'),
                                     'lugar': pd.Series(dtype='str'),
                                     'enlace': pd.Series(dtype='str')})

    nuevos_eventos = []

    while True:
        events = driver.find_elements(By.CSS_SELECTOR, 'div[data-testid="search-event"]')

        for ev in events:
            try:
                enlace_tag = ev.find_element(By.CSS_SELECTOR, 'a.event-card-link')
                raw_label = enlace_tag.get_attribute('aria-label') or ""
                nombre = raw_label[5:].strip() if raw_label.lower().startswith("view ") else enlace_tag.text.strip()
            except NoSuchElementException:
                nombre = "Sin nombre"

            try:
                enlace = enlace_tag.get_attribute("href")
            except NoSuchElementException:
                enlace = "Sin enlace"

            fecha = "Sin fecha"
            lugar = "Sin lugar"

            try:
                p_tags = ev.find_elements(By.CSS_SELECTOR, 'p.event-card__clamp-line--one')
                for p in p_tags:
                    text = p.text.strip()
                    if any(char.isdigit() for char in text):
                        fecha = text
                    else:
                        lugar = text
            except NoSuchElementException:
                pass

            print("🎫", nombre)
            print("🗓️", fecha)
            print("📍", lugar)
            print("🔗", enlace)
            print("-" * 60)

            nuevos_eventos.append({'nombre': nombre, 'fecha': fecha, 'lugar': lugar, 'enlace': enlace})

        try:
            next_button = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'button[data-testid="page-next"]'))
            )
            aria_disabled = next_button.get_attribute("aria-disabled")
            if aria_disabled == "false":
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", next_button)
                time.sleep(0.5)
                driver.execute_script("arguments[0].click();", next_button)
                time.sleep(5)
            else:
                print("Botón 'Next Page' deshabilitado. Fin de paginación.")
                break
        except Exception as e:
            print(f"No se pudo avanzar a la siguiente página o error: {e}")
            break

    driver.quit()

    nuevos_df = pd.DataFrame(nuevos_eventos)

    final_df = pd.concat([df_existente, nuevos_df], ignore_index=True)
    final_df.drop_duplicates(subset=['enlace'], keep='last', inplace=True)
    final_df.sort_values(by=['nombre', 'fecha'], inplace=True)

    resultados = [
        {"nombre": row["nombre"], "fecha": row["fecha"], "lugar": row["lugar"]}
        for _, row in final_df.iterrows()
    ]

    with open('eventos_scrapeados.json', 'w', encoding='utf-8') as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    print("✅ Scrapeo finalizado. Eventos guardados en 'eventos_scrapeados.json'.")

def filtrar_eventos_cercanos():
    MY_LOCATION = pedir_ubicacion_manual()
    print(f"Ubicación usada: {MY_LOCATION}")

    with open('eventos_scrapeados.json', 'r', encoding='utf-8') as f:
        events = json.load(f)

    lugares_unicos = set(event['lugar'] for event in events if event.get('lugar'))
    print(f"Encontrados {len(lugares_unicos)} lugares únicos para geocodificar.")

    # Cargar cache si existe
    coords_por_lugar = {}
    try:
        if os.path.exists('geocode_cache.json') and os.path.getsize('geocode_cache.json') > 0:
            with open('geocode_cache.json', 'r', encoding='utf-8') as f:
                coords_por_lugar = json.load(f)
        else:
            print("⚠️ geocode_cache.json vacío o no existe. Creando nuevo cache.")
    except json.JSONDecodeError:
        print("⚠️ El archivo geocode_cache.json está corrupto. Creando nuevo cache.")
       


    # Geocodificar solo lugares no cacheados
    for lugar in lugares_unicos:
        if lugar not in coords_por_lugar:
            print(f"Geocodificando: {lugar}")
            coords = geocode_nominatim(lugar, coords_por_lugar)
            time.sleep(1)
        else:
            print(f"Usando cache para: {lugar}")

    # Guardar cache actualizado
    with open('geocode_cache.json', 'w', encoding='utf-8') as f:
        json.dump(coords_por_lugar, f, ensure_ascii=False, indent=2)

    nearby_events = []
    for event in events:
        lugar = event.get('lugar')
        coords = coords_por_lugar.get(lugar)
        if coords:
            distancia = geodesic(MY_LOCATION, coords).km
            print(f"{event['nombre']} está a {distancia:.2f} km")
            if distancia <= 20:
                nearby_events.append(event)
        else:
            print(f"No se pudo geocodificar: {lugar}")

    with open('eventos_cercanos.json', 'w', encoding='utf-8') as f:
        json.dump(nearby_events, f, ensure_ascii=False, indent=2)

    print("✅ Eventos cercanos guardados en 'eventos_cercanos.json'.")

if __name__ == "__main__":
    print("🔍 Iniciando scraping de eventos...")
    scrape_eventos()
    print("\n📍 Filtrando eventos cercanos a tu ubicación...")
    filtrar_eventos_cercanos()

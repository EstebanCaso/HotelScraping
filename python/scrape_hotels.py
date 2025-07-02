from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup, Tag
from datetime import datetime, timedelta
import json
import time

# Obtener fechas dinámicamente
hoy = datetime.today().date()
mañana = hoy + timedelta(days=1)

# URL con fechas dinámicas
url = (
    "https://www.booking.com/searchresults.es.html?"
    f"ss=Tijuana&checkin={hoy}&checkout={mañana}&group_adults=1&no_rooms=1&group_children=0"
)

# Configurar navegador
options = Options()
# Descomenta para ocultar ventana del navegador en producción
# options.add_argument("--headless")
driver = webdriver.Chrome(options=options)

# Abrir página
print(f"Abriendo Booking con fecha {hoy} a {mañana}")
driver.get(url)
time.sleep(5)  # Espera básica para ver la página

print(driver.page_source)  # Imprime el HTML para inspección

# Esperar a que cargue al menos un hotel
WebDriverWait(driver, 40).until(
    EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='property-card']"))
)

# Obtener HTML de la página
soup = BeautifulSoup(driver.page_source, "html.parser")
driver.quit()

# Buscar tarjetas de hoteles
hotels = soup.find_all("div", {"data-testid": "property-card"})  # type: ignore

data = []

# Extraer nombre y precio
for hotel in hotels:  
    try:
        nombre = hotel.find("div", {"data-testid": "title"}).get_text(strip=True)  # type: ignore
        precio_tag = hotel.find("span", {"data-testid": "price-and-discounted-price"})  # type: ignore
        if precio_tag:
            precio_texto = precio_tag.get_text(strip=True)  # type: ignore
            data.append({"Nombre del Hotel": nombre, "Precio": precio_texto})
    except Exception:
        continue

# Guardar como JSON
with open(f"hoteles_tijuana_{hoy}.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Mostrar resultados
print(json.dumps(data, indent=2, ensure_ascii=False))

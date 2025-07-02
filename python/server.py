from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from scraper_api import EventScraperAPI

app = FastAPI()

# Permitir CORS para desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    latitude: float
    longitude: float
    hotel_name: Optional[str] = None
    radius_km: Optional[float] = 20.0

@app.post("/scrape")
async def scrape_events(req: ScrapeRequest):
    scraper = EventScraperAPI()
    hotel_name = req.hotel_name if req.hotel_name is not None else ""
    radius_km = req.radius_km if req.radius_km is not None else 20.0
    result = scraper.run_full_analysis(
        hotel_lat=req.latitude,
        hotel_lon=req.longitude,
        hotel_name=hotel_name,
        radius_km=radius_km
    )
    return result

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True) 
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import threading
import json
import os
from Scrapeo_geo import scrape_eventos, filtrar_eventos_cercanos, geocode_nominatim
from geopy.distance import geodesic
import time

class EventScraperGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Event Scraper - Hotel Location Finder")
        self.root.geometry("1000x700")
        self.root.configure(bg='#f0f0f0')
        
        # Variables
        self.hotel_coords = None
        self.events_data = []
        
        self.setup_ui()
        
    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="Event Scraper", font=('Arial', 24, 'bold'))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # Hotel coordinates section
        coords_frame = ttk.LabelFrame(main_frame, text="Hotel Coordinates", padding="15")
        coords_frame.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 20))
        coords_frame.columnconfigure(1, weight=1)
        
        # Hotel name
        ttk.Label(coords_frame, text="Hotel Name (Optional):").grid(row=0, column=0, sticky=tk.W, pady=(0, 10))
        self.hotel_name_var = tk.StringVar()
        hotel_name_entry = ttk.Entry(coords_frame, textvariable=self.hotel_name_var, width=40)
        hotel_name_entry.grid(row=0, column=1, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Latitude
        ttk.Label(coords_frame, text="Latitude:").grid(row=1, column=0, sticky=tk.W, pady=(0, 10))
        self.lat_var = tk.StringVar()
        lat_entry = ttk.Entry(coords_frame, textvariable=self.lat_var, width=20)
        lat_entry.grid(row=1, column=1, sticky=(tk.W, tk.E), padx=(10, 5), pady=(0, 10))
        
        # Longitude
        ttk.Label(coords_frame, text="Longitude:").grid(row=2, column=0, sticky=tk.W, pady=(0, 10))
        self.lon_var = tk.StringVar()
        lon_entry = ttk.Entry(coords_frame, textvariable=self.lon_var, width=20)
        lon_entry.grid(row=2, column=1, sticky=(tk.W, tk.E), padx=(10, 5), pady=(0, 10))
        
        # Sample button
        sample_btn = ttk.Button(coords_frame, text="Use Sample (Tijuana)", 
                               command=self.fill_sample_coords)
        sample_btn.grid(row=1, column=2, rowspan=2, padx=(5, 0), pady=(0, 10))
        
        # Buttons frame
        buttons_frame = ttk.Frame(main_frame)
        buttons_frame.grid(row=2, column=0, columnspan=3, pady=(0, 20))
        
        # Scrape button
        self.scrape_btn = ttk.Button(buttons_frame, text="🔍 Scrape Events", 
                                    command=self.start_scraping, style='Accent.TButton')
        self.scrape_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # Filter button
        self.filter_btn = ttk.Button(buttons_frame, text="📍 Filter Nearby Events", 
                                    command=self.filter_events, state='disabled')
        self.filter_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # Progress bar
        self.progress = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Status label
        self.status_var = tk.StringVar(value="Ready to scrape events...")
        status_label = ttk.Label(main_frame, textvariable=self.status_var)
        status_label.grid(row=4, column=0, columnspan=3, pady=(0, 20))
        
        # Results frame
        results_frame = ttk.LabelFrame(main_frame, text="Events Results", padding="15")
        results_frame.grid(row=5, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 20))
        results_frame.columnconfigure(0, weight=1)
        results_frame.rowconfigure(0, weight=1)
        main_frame.rowconfigure(5, weight=1)
        
        # Treeview for events
        columns = ('Name', 'Date', 'Venue', 'Distance')
        self.tree = ttk.Treeview(results_frame, columns=columns, show='headings', height=15)
        
        # Define headings
        self.tree.heading('Name', text='Event Name')
        self.tree.heading('Date', text='Date & Time')
        self.tree.heading('Venue', text='Venue')
        self.tree.heading('Distance', text='Distance (km)')
        
        # Configure column widths
        self.tree.column('Name', width=300)
        self.tree.column('Date', width=150)
        self.tree.column('Venue', width=200)
        self.tree.column('Distance', width=100)
        
        # Scrollbars
        v_scrollbar = ttk.Scrollbar(results_frame, orient=tk.VERTICAL, command=self.tree.yview)
        h_scrollbar = ttk.Scrollbar(results_frame, orient=tk.HORIZONTAL, command=self.tree.xview)
        self.tree.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
        
        # Grid treeview and scrollbars
        self.tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        v_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        h_scrollbar.grid(row=1, column=0, sticky=(tk.W, tk.E))
        
        # Export button
        export_btn = ttk.Button(results_frame, text="💾 Export to JSON", 
                               command=self.export_results)
        export_btn.grid(row=2, column=0, pady=(10, 0), sticky=tk.W)
        
    def fill_sample_coords(self):
        """Fill sample coordinates for Tijuana"""
        self.lat_var.set("32.5149")
        self.lon_var.set("-117.0382")
        self.hotel_name_var.set("Hotel Tijuana")
        
    def validate_coordinates(self):
        """Validate coordinate inputs"""
        try:
            lat = float(self.lat_var.get())
            lon = float(self.lon_var.get())
            
            if not (-90 <= lat <= 90):
                raise ValueError("Latitude must be between -90 and 90")
            if not (-180 <= lon <= 180):
                raise ValueError("Longitude must be between -180 and 180")
                
            return lat, lon
        except ValueError as e:
            messagebox.showerror("Invalid Coordinates", str(e))
            return None, None
            
    def start_scraping(self):
        """Start the scraping process in a separate thread"""
        lat, lon = self.validate_coordinates()
        if lat is None or lon is None:
            return
            
        self.hotel_coords = (lat, lon)
        self.scrape_btn.config(state='disabled')
        self.progress.start()
        self.status_var.set("Scraping events from Eventbrite...")
        
        # Start scraping in separate thread
        thread = threading.Thread(target=self.scrape_events_thread)
        thread.daemon = True
        thread.start()
        
    def scrape_events_thread(self):
        """Thread function for scraping events"""
        try:
            # Call the scraping function
            scrape_eventos()
            
            # Update UI in main thread
            self.root.after(0, self.scraping_completed)
            
        except Exception as e:
            self.root.after(0, lambda: self.scraping_error(str(e)))
            
    def scraping_completed(self):
        """Called when scraping is completed"""
        self.progress.stop()
        self.status_var.set("Scraping completed! Ready to filter events.")
        self.scrape_btn.config(state='normal')
        self.filter_btn.config(state='normal')
        
        # Load and display all events
        self.load_all_events()
        
    def scraping_error(self, error_msg):
        """Called when scraping encounters an error"""
        self.progress.stop()
        self.status_var.set("Scraping failed!")
        self.scrape_btn.config(state='normal')
        messagebox.showerror("Scraping Error", f"Failed to scrape events:\n{error_msg}")
        
    def load_all_events(self):
        """Load all scraped events into the table"""
        try:
            if os.path.exists('eventos_scrapeados.json'):
                with open('eventos_scrapeados.json', 'r', encoding='utf-8') as f:
                    self.events_data = json.load(f)
                    
                self.populate_tree(self.events_data)
                self.status_var.set(f"Loaded {len(self.events_data)} events")
            else:
                messagebox.showwarning("No Data", "No events file found. Please scrape events first.")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load events: {str(e)}")
            
    def filter_events(self):
        """Filter events based on hotel coordinates"""
        if not self.hotel_coords:
            messagebox.showerror("Error", "Please enter hotel coordinates first")
            return
            
        self.progress.start()
        self.status_var.set("Filtering nearby events...")
        self.filter_btn.config(state='disabled')
        
        # Start filtering in separate thread
        thread = threading.Thread(target=self.filter_events_thread)
        thread.daemon = True
        thread.start()
        
    def filter_events_thread(self):
        """Thread function for filtering events"""
        try:
            # Load events
            with open('eventos_scrapeados.json', 'r', encoding='utf-8') as f:
                events = json.load(f)
                
            # Get unique places and geocode them
            lugares_unicos = set(event['lugar'] for event in events if event.get('lugar'))
            
            # Load or create geocoding cache
            coords_por_lugar = {}
            if os.path.exists('geocode_cache.json'):
                try:
                    with open('geocode_cache.json', 'r', encoding='utf-8') as f:
                        coords_por_lugar = json.load(f)
                except:
                    pass
                    
            # Geocode missing places
            for lugar in lugares_unicos:
                if lugar not in coords_por_lugar:
                    coords = geocode_nominatim(lugar, coords_por_lugar)
                    time.sleep(1)  # Rate limiting
                    
            # Save updated cache
            with open('geocode_cache.json', 'w', encoding='utf-8') as f:
                json.dump(coords_por_lugar, f, ensure_ascii=False, indent=2)
                
            # Filter nearby events
            nearby_events = []
            for event in events:
                lugar = event.get('lugar')
                coords = coords_por_lugar.get(lugar)
                if coords:
                    distancia = geodesic(self.hotel_coords, coords).km
                    if distancia <= 20:  # 20km radius
                        event_copy = event.copy()
                        event_copy['distancia'] = round(distancia, 2)
                        nearby_events.append(event_copy)
                        
            # Save filtered events
            with open('eventos_cercanos.json', 'w', encoding='utf-8') as f:
                json.dump(nearby_events, f, ensure_ascii=False, indent=2)
                
            # Update UI
            self.root.after(0, lambda: self.filtering_completed(nearby_events))
            
        except Exception as e:
            self.root.after(0, lambda: self.filtering_error(str(e)))
            
    def filtering_completed(self, nearby_events):
        """Called when filtering is completed"""
        self.progress.stop()
        self.filter_btn.config(state='normal')
        self.events_data = nearby_events
        self.populate_tree(nearby_events)
        
        hotel_name = self.hotel_name_var.get() or "your location"
        self.status_var.set(f"Found {len(nearby_events)} events within 20km of {hotel_name}")
        
    def filtering_error(self, error_msg):
        """Called when filtering encounters an error"""
        self.progress.stop()
        self.filter_btn.config(state='normal')
        messagebox.showerror("Filtering Error", f"Failed to filter events:\n{error_msg}")
        
    def populate_tree(self, events):
        """Populate the treeview with events"""
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)
            
        # Add events
        for event in events:
            distance = f"{event['distancia']:.1f}" if 'distancia' in event else "N/A"
            self.tree.insert('', tk.END, values=(
                event.get('nombre', 'N/A'),
                event.get('fecha', 'N/A'),
                event.get('lugar', 'N/A'),
                distance
            ))
            
    def export_results(self):
        """Export current results to JSON"""
        if not self.events_data:
            messagebox.showwarning("No Data", "No events to export")
            return
            
        try:
            filename = f"exported_events_{int(time.time())}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.events_data, f, ensure_ascii=False, indent=2)
                
            messagebox.showinfo("Export Successful", f"Events exported to {filename}")
            
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export events:\n{str(e)}")

def main():
    root = tk.Tk()
    app = EventScraperGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()
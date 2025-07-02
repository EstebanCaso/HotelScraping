# Event Scraper Application

A comprehensive event discovery application that combines Python web scraping with a modern React frontend to find music events near hotel locations in Tijuana.

## Features

### Web Application (React)
- **Beautiful, responsive UI** with modern design aesthetics
- **Hotel coordinate input** with validation and sample data
- **Real-time event scraping** with loading indicators
- **Interactive events table** with sorting and filtering
- **Supabase integration** for data persistence
- **Distance-based filtering** (5km, 10km, 20km, 50km radius)
- **Search functionality** across event names and venues

### Python Backend
- **Automated web scraping** from Eventbrite
- **Geocoding integration** with OpenStreetMap Nominatim
- **Distance calculations** using geopy
- **Caching system** for geocoded locations
- **GUI application** with tkinter for standalone use
- **JSON data export** capabilities

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Python 3.8+, Selenium, Pandas, Geopy
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom gradients

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Chrome browser (for Selenium)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-scraper-app
   ```

2. **Install Python dependencies**
   ```bash
   cd python
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

### Running the Application

#### Web Application
```bash
npm run dev
```

#### Python GUI Application
```bash
cd python
python gui_app.py
```

#### Python CLI Application
```bash
cd python
python Scrapeo_geo.py
```

## Usage

### Web Interface

1. **Enter Hotel Coordinates**
   - Input latitude and longitude in decimal degrees
   - Optionally provide a hotel name
   - Use the "Sample" button for Tijuana coordinates

2. **Find Events**
   - Click "Find Events" to start scraping
   - Wait for the scraping process to complete
   - View results in the interactive table

3. **Filter and Search**
   - Use the search bar to find specific events or venues
   - Adjust the distance filter (5km to 50km)
   - Sort by event name, date, venue, or distance

### Python GUI

1. **Launch the GUI application**
2. **Enter hotel coordinates** (latitude/longitude)
3. **Click "Scrape Events"** to gather data from Eventbrite
4. **Click "Filter Nearby Events"** to find events within 20km
5. **Export results** to JSON format

## Data Flow

1. **Input**: Hotel coordinates (latitude, longitude)
2. **Scraping**: Automated extraction from Eventbrite
3. **Geocoding**: Convert venue addresses to coordinates
4. **Filtering**: Calculate distances and filter by radius
5. **Display**: Present results in sortable, searchable table
6. **Storage**: Save to Supabase database and JSON files

## File Structure

```
├── src/
│   ├── components/          # React components
│   ├── services/           # API and data services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── lib/                # Library configurations
├── python/
│   ├── Scrapeo_geo.py      # Original scraping script
│   ├── gui_app.py          # GUI application
│   └── requirements.txt    # Python dependencies
└── README.md
```

## Features in Detail

### Coordinate Validation
- Validates latitude (-90 to 90) and longitude (-180 to 180)
- Real-time error feedback
- Sample coordinate filling

### Event Scraping
- Scrapes Eventbrite for music events in Tijuana
- Handles pagination automatically
- Extracts event name, date, venue, and links
- Implements rate limiting and error handling

### Distance Calculation
- Uses geodesic distance calculations
- Caches geocoded locations for performance
- Filters events within specified radius

### Data Persistence
- Saves to JSON files for Python compatibility
- Integrates with Supabase for web application
- Maintains data consistency across platforms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
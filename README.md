# Encephalic

<div align="center">

**Advanced EEG Analysis Terminal**

A professional-grade EEG analysis platform with terminal-style interface for processing, visualizing, and analyzing brain signals using Flask, MNE-Python, Next.js, and shadcn/ui.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green)](https://flask.palletsprojects.com/)
[![MNE-Python](https://img.shields.io/badge/MNE-1.6-orange)](https://mne.tools/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)

</div>

---

## ✨ Features

### Core Functionality
- **Real-time EEG Signal Visualization** - Multi-channel neural activity traces with interactive plotting
- **Topographic Brain Maps** - Spatial distribution of brain activity with time-point precision
- **Power Spectral Density Analysis** - Comprehensive frequency domain analysis
- **Frequency Band Power** - Delta, Theta, Alpha, Beta, and Gamma band analysis
- **Interactive Playback** - Play/pause animation with precise time control

### Professional UI
- **Terminal-Style Interface** - Cyberpunk-inspired analysis board design
- **Modular Panel System** - Separate optimized components for each analysis type
- **Color-Coded Data** - Different colors for different analysis panels
- **Responsive Layout** - Adaptive grid system for any screen size

### Performance Optimizations
- **Flask Backend** - Lightweight and efficient REST API
- **Aggressive Caching** - LRU caching for all expensive operations
- **Debounced Requests** - 200ms debounce on topomap slider (10x fewer requests)
- **Memoized Rendering** - React.useMemo for plot data (prevents unnecessary re-renders)
- **Gunicorn Workers** - Multi-worker production server
- **Time-Window Fetching** - Only fetch visible data ranges
- **Fast & Efficient** - Minimal overhead for maximum performance

---

## Quick Start (Recommended)

The easiest way to run Encephalic is using the provided startup script. It automatically handles all dependency installation and setup.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 1.29 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/A12N4V/Encephalic.git
   cd Encephalic
   ```

2. **Run the startup script:**
   ```bash
   ./start.sh
   ```

   The script will automatically:
   - Install all frontend dependencies (Node.js packages)
   - Install all backend dependencies (Python packages)
   - Build and start the application using Docker

   **Note:** First run may take a few minutes as dependencies are downloaded and installed.

3. **Access the application:**
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:8000

That's it! No manual setup required.

### Stop the Application
Press `Ctrl+C` in the terminal, then run:
```bash
docker-compose down
```

### Clean Build (If Needed)

If you encounter build errors or need to rebuild from scratch (clearing Docker cache):
```bash
./clean-start.sh
```

This will stop containers, remove cached layers, and rebuild everything fresh.

---

## 📁 Project Structure

```
Encephalic/
├── backend/                   # Flask REST API (Lightweight)
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # Docker configuration
│
├── frontend/                  # Next.js Frontend
│   ├── app/                   # Next.js app directory
│   │   ├── page.tsx           # Main page
│   │   └── globals.css        # Terminal-style CSS
│   ├── components/            # React components
│   │   ├── Dashboard.tsx      # Main terminal layout
│   │   └── panels/            # Modular panel components
│   │       ├── SignalsPanel.tsx
│   │       ├── TopomapPanel.tsx
│   │       ├── PSDPanel.tsx
│   │       ├── BandsPanel.tsx
│   │       └── InfoPanel.tsx
│   ├── hooks/                 # Custom React hooks
│   │   └── useEEGData.ts      # Data fetching with debounce
│   ├── package.json           # Node.js dependencies
│   └── Dockerfile             # Docker configuration
│
├── docker-compose.yml         # Orchestration config
├── README_DEPLOYMENT.md       # Detailed deployment guide
└── README.md                  # This file
```

---

## API Endpoints

The backend provides the following REST API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/eeg-data` | GET | Get EEG signal data (params: tmin, tmax) |
| `/api/eeg-info` | GET | Get EEG metadata |
| `/api/eeg-topomap/<time>` | GET | Generate topographic map at time point |
| `/api/eeg-psd` | GET | Get power spectral density |
| `/api/eeg-bands` | GET | Get frequency band powers |

### Example API Calls

**Get EEG Data:**
```bash
curl http://localhost:8000/api/eeg-data?tmin=0&tmax=10
```

**Get Topographic Map:**
```bash
curl http://localhost:8000/api/eeg-topomap/5.0 --output topomap.png
```

---

## 🛠️ Technology Stack

### Backend (Flask)
- **Flask** 3.0 - Lightweight Python web framework
- **Flask-CORS** 4.0 - Cross-origin resource sharing
- **MNE-Python** 1.6 - EEG/MEG analysis library
- **NumPy** 1.26 - Numerical computing
- **SciPy** 1.11 - Scientific computing
- **Matplotlib** 3.8 - Brain topomap visualization
- **Gunicorn** 21.2 - Production WSGI server
- **LRU Caching** - High-performance result caching

### Frontend (Next.js v2.0)
- **Next.js** 14 - React framework with SSR
- **TypeScript** 5.3 - Type-safe development
- **Tailwind CSS** 3.4 - Utility-first styling
- **shadcn/ui** - Radix UI component library
- **Plotly.js** 2.29 - Interactive visualizations
- **Axios** 1.6 - HTTP client with interceptors
- **Custom Hooks** - Optimized data fetching

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Multi-stage Builds** - Optimized image sizes
- **Health Checks** - Container monitoring
- **Volume Persistence** - MNE data caching

---

## Usage

1. **View EEG Signals**: Navigate to the "Signals" tab to see real-time multi-channel EEG data
2. **Explore Topographic Maps**: Click the "Topographic Map" tab and use the slider or play button to animate brain activity over time
3. **Analyze Frequencies**: View the "Frequency Analysis" tab for power spectral density plots
4. **Interactive Exploration**: Click on any point in the signal plot to jump to that time point

---

## System Requirements

- Docker 20.10+
- Docker Compose 1.29+
- 4GB RAM minimum
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## Troubleshooting

**Port already in use error from Docker:**

If you see `Error response from daemon: ports are not available: exposing port TCP 0.0.0.0:80` or `0.0.0.0:8000`:

This is usually caused by Docker having stale port bindings. The `start.sh` script includes automatic cleanup, but if the issue persists:

**Option 1 - Use the cleanup script:**
```bash
./cleanup-ports.sh
```

**Option 2 - Manual cleanup:**
```bash
# Stop all Docker containers and networks
docker-compose down -v
docker network rm encephalic-network 2>/dev/null || true

# Kill docker-proxy processes
pkill -9 -f "docker-proxy.*8000"
pkill -9 -f "docker-proxy.*80"

# Kill any processes on the ports
lsof -ti:80 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

**Option 3 - Restart Docker:**

If cleanup doesn't work, restart the Docker daemon:
```bash
# Linux
sudo systemctl restart docker

# Mac/Windows
# Restart Docker Desktop from the system tray
```

**Docker build fails or shows "Module not found" errors:**

This usually happens due to Docker using cached layers. Use the clean build script:
```bash
./clean-start.sh
```

Or manually clean and rebuild:
```bash
# Stop containers
docker-compose down

# Build without cache
docker-compose build --no-cache

# Start containers
docker-compose up
```

For more aggressive cleaning:
```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

**MNE data download:**

The first time you run the application, MNE will download sample EEG data (~1.5GB). This may take a few minutes. The download happens automatically during container startup.

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Author

**A12N4V**
- GitHub: [@A12N4V](https://github.com/A12N4V)

---

## Acknowledgments

- [MNE-Python](https://mne.tools/) for EEG analysis tools
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Next.js](https://nextjs.org/) for the React framework
- [Plotly](https://plotly.com/) for visualizations

---

<div align="center">

**Made for neuroscience and brain research**

[Report Bug](https://github.com/A12N4V/Encephalic/issues) · [Request Feature](https://github.com/A12N4V/Encephalic/issues)

</div>


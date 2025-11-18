# Encephalic

<div align="center">

**Advanced EEG Visualization Platform**

A modern web application for processing, visualizing, and analyzing EEG data using MNE Python, Flask, Next.js, and shadcn/ui.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-blue)](https://flask.palletsprojects.com/)
[![MNE-Python](https://img.shields.io/badge/MNE-1.6-orange)](https://mne.tools/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)

</div>

---

## Features

- **Real-time EEG Signal Visualization** - Interactive multi-channel EEG plots
- **Topographic Brain Maps** - Spatial distribution of brain activity
- **Power Spectral Density Analysis** - Frequency domain analysis
- **Frequency Band Analysis** - Delta, Theta, Alpha, Beta, and Gamma bands
- **Interactive Timeline** - Play/pause animation and manual time selection
- **Modern Dark UI** - Sleek, responsive design with shadcn/ui components

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
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000

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

## Advanced: Local Development Setup (Without Docker)

**Note:** This section is only for advanced users who want to run the application without Docker. For most users, the Quick Start method above is recommended as it handles all setup automatically.

If you prefer to run the backend and frontend separately for development:

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On Linux/Mac:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the Flask backend:**
   ```bash
   python app.py
   ```

   The backend will start on **http://localhost:5000**

### Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Run the Next.js development server:**
   ```bash
   npm run dev
   ```

   The frontend will start on **http://localhost:3000**

### Access the Application

Open your browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## Project Structure

```
Encephalic/
├── backend/                    # Flask REST API
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # Docker configuration
│
├── frontend/                  # Next.js Frontend
│   ├── app/                   # Next.js pages
│   ├── components/            # React components
│   ├── lib/                   # Utility functions
│   ├── package.json           # Node.js dependencies
│   └── Dockerfile             # Docker configuration
│
├── docker-compose.yml         # Docker Compose config
├── start.sh                   # Startup script
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
curl http://localhost:5000/api/eeg-data?tmin=0&tmax=10
```

**Get Topographic Map:**
```bash
curl http://localhost:5000/api/eeg-topomap/5.0 --output topomap.png
```

---

## Technology Stack

### Backend
- **Flask** 3.0 - Python web framework
- **MNE-Python** 1.6 - EEG/MEG analysis library
- **NumPy** - Numerical computing
- **Matplotlib** - Plotting library
- **Gunicorn** - Production WSGI server

### Frontend
- **Next.js** 14 - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - UI component library
- **Plotly.js** - Interactive charts
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## Usage

1. **View EEG Signals**: Navigate to the "Signals" tab to see real-time multi-channel EEG data
2. **Explore Topographic Maps**: Click the "Topographic Map" tab and use the slider or play button to animate brain activity over time
3. **Analyze Frequencies**: View the "Frequency Analysis" tab for power spectral density plots
4. **Interactive Exploration**: Click on any point in the signal plot to jump to that time point

---

## System Requirements

### For Docker Installation:
- Docker 20.10+
- Docker Compose 1.29+
- 4GB RAM minimum
- Modern web browser (Chrome, Firefox, Safari, Edge)

### For Local Development:
- Python 3.11+
- Node.js 20+
- npm or yarn
- 4GB RAM minimum

---

## Troubleshooting

### Docker Issues

**Port already in use:**
If you see an error about ports 3000 or 5000 already being used:
```bash
# Find and stop the process using the port
# On Linux/Mac:
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
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

### Local Development Issues

**Backend: MNE data download:**
The first time you run the backend, MNE will download sample EEG data (~1.5GB). This may take a few minutes.

**Frontend: Module not found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

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


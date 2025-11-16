# Encephalic - EEG Visualization Platform

<div align="center">
  <img src="s3.png" alt="EEG Graph" width="30%" style="display:inline-block;" />
  <img src="s1.png" alt="Heatmap" width="30%" style="display:inline-block;" />
  <img src="s2.png" alt="3D Brain Map" width="30%" style="display:inline-block;" />
</div>

A modern, professional EEG visualization web application designed to process, display, and analyze EEG data. Built with cutting-edge technologies for optimal performance and user experience.

## ✨ Features

- **Real-time EEG Signal Visualization**: Interactive, multi-channel EEG waveform plotting with Plotly.js
- **Topographic Brain Mapping**: Dynamic heatmaps showing spatial brain activity distribution
- **3D Brain Visualization**: Explore brain activity in three-dimensional space
- **Time-series Analysis**: Scrub through EEG data with interactive timeline controls
- **Playback Mode**: Automated playback of EEG recordings with real-time updates
- **Dark/Light Theme**: Toggle between dark and light modes for comfortable viewing
- **Modern UI**: Built with Next.js and shadcn/ui for a sleek, responsive interface

## 🚀 Quick Start with Docker

The easiest way to run Encephalic is using Docker. This method requires no manual setup of dependencies.

### Prerequisites

- [Docker](https://www.docker.com/get-started) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

### Running the Application

1. **Clone the repository**
   ```bash
   git clone https://github.com/A12N4V/EEGVis.git
   cd EEGVis
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

   Or use the convenience script:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. **Stop the application**
   ```bash
   docker-compose down
   ```

   To also remove volumes:
   ```bash
   docker-compose down -v
   ```

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Visualization**: Plotly.js, React Plotly
- **Icons**: Lucide React

**Backend:**
- **Framework**: Flask 3.0
- **Language**: Python 3.11
- **EEG Processing**: MNE-Python
- **Scientific Computing**: NumPy, SciPy, Matplotlib
- **Server**: Gunicorn

**DevOps:**
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Networking**: Bridge network for service communication

### Project Structure

```
EEGVis/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js app directory
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── EEGVisualizer.tsx # Main visualization component
│   ├── lib/                # Utility libraries
│   ├── Dockerfile          # Frontend Docker configuration
│   └── package.json        # Node dependencies
│
├── backend/                 # Flask backend application
│   ├── app/                # Application package
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── Dockerfile          # Backend Docker configuration
│   ├── requirements.txt    # Python dependencies
│   └── run.py             # Application entry point
│
├── docker-compose.yml      # Docker orchestration config
├── start.sh               # Convenience startup script
└── README.md              # This file
```

## 🛠️ Development Setup

### Without Docker (Manual Setup)

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask server**
   ```bash
   python run.py
   ```

   The backend will run on http://localhost:5000

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

   The frontend will run on http://localhost:3000

## 📡 API Endpoints

### GET `/api/eeg-data`
Retrieves EEG signal data for all channels.

**Response:**
```json
{
  "labels": ["EEG 001", "EEG 002", ...],
  "data": [[...], [...], ...],
  "sampling_rate": 600.614990234375,
  "duration": 10
}
```

### GET `/api/eeg-heatmap/<time_point>`
Generates a topographic heatmap at a specific time point.

**Parameters:**
- `time_point` (float): Time in seconds

**Response:** PNG image

### GET `/api/eeg-3d/<time>`
Generates a 3D brain visualization.

**Parameters:**
- `time` (float): Time in seconds

**Response:** PNG image

### GET `/api/health`
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "service": "EEG Backend API"
}
```

## 🎨 Features Showcase

### Interactive EEG Plotting
- Multi-channel visualization with individual trace controls
- Click on any point to see corresponding brain activity
- Zoom and pan capabilities for detailed analysis

### Topographic Mapping
- Real-time topographic plots showing spatial distribution
- Color-coded amplitude visualization
- Sensor position display

### Timeline Control
- Slider for precise time point selection
- Play/pause functionality for automated playback
- Time display with millisecond precision

### Modern UI/UX
- Gradient backgrounds with glassmorphism effects
- Smooth animations and transitions
- Responsive design for all screen sizes
- Accessible color schemes

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend:**
```env
FLASK_APP=run.py
FLASK_ENV=production
PORT=5000
```

## 🐛 Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Frontend
  - "5001:5000"  # Backend
```

**Container won't start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MNE-Python](https://mne.tools/) for EEG processing capabilities
- [Next.js](https://nextjs.org/) for the frontend framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Plotly](https://plotly.com/) for interactive visualizations

## 📧 Contact

For questions, feedback, or support:
- GitHub Issues: [A12N4V/EEGVis](https://github.com/A12N4V/EEGVis/issues)
- Repository: [A12N4V/EEGVis](https://github.com/A12N4V/EEGVis)

---

**Built with ❤️ by the EEGVis Team**

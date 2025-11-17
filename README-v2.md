# Encephalic v2.0 🧠

<div align="center">

**Advanced EEG Visualization Platform**

A modern, sleek web application for processing, visualizing, and analyzing EEG data using MNE Python, Flask, Next.js, and shadcn/ui.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-blue)](https://flask.palletsprojects.com/)
[![MNE-Python](https://img.shields.io/badge/MNE-1.6-orange)](https://mne.tools/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)

</div>

---

## ✨ Features

### 🎯 Core Capabilities
- **Real-time EEG Signal Visualization** - Interactive multi-channel EEG plots with Plotly.js
- **Topographic Brain Maps** - Spatial distribution of brain activity at any time point
- **Power Spectral Density Analysis** - Frequency domain analysis of neural oscillations
- **Frequency Band Analysis** - Delta, Theta, Alpha, Beta, and Gamma band power
- **Interactive Timeline Control** - Play/pause animation and manual time selection

### 🎨 Modern UI/UX
- **Dark Mode Design** - Sleek gradient-based dark theme optimized for data visualization
- **Responsive Layout** - Works seamlessly on desktop and mobile devices
- **shadcn/ui Components** - Beautiful, accessible component library
- **Smooth Animations** - Fluid transitions and interactions

### 🚀 Technical Stack
- **Backend**: Flask REST API with MNE Python for advanced EEG processing
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Visualization**: Plotly.js for interactive charts and Matplotlib for topographic maps
- **Deployment**: Docker and Docker Compose for one-command setup

---

## 🐳 Quick Start with Docker (Recommended)

The easiest way to run Encephalic is using Docker. Just one command!

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (1.29+)

### Run the Application

```bash
# Clone the repository
git clone https://github.com/A12N4V/Encephalic.git
cd Encephalic

# Checkout v2 branch
git checkout v2

# Start the application
docker-compose up
```

That's it! The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Stop the Application

```bash
docker-compose down
```

---

## 💻 Development Setup (Without Docker)

If you prefer to run the services separately for development:

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will run on `http://localhost:3000`

---

## 📁 Project Structure

```
Encephalic/
├── backend/                 # Flask REST API
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend Docker configuration
│   └── .dockerignore
│
├── frontend/               # Next.js Frontend
│   ├── app/                # Next.js app directory
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── EEGVisualization.tsx  # Main visualization component
│   ├── lib/                # Utility functions
│   ├── package.json        # Node dependencies
│   ├── Dockerfile          # Frontend Docker configuration
│   ├── next.config.js      # Next.js configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── tsconfig.json       # TypeScript configuration
│
├── docker-compose.yml      # Docker Compose configuration
├── .gitignore
└── README-v2.md           # This file
```

---

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```
Returns service status.

### EEG Data
```
GET /api/eeg-data?tmin=0&tmax=10
```
Retrieve EEG signal data for specified time range.

**Query Parameters:**
- `tmin` - Start time in seconds (default: 0)
- `tmax` - End time in seconds (default: 10)

### EEG Info
```
GET /api/eeg-info
```
Get metadata about the EEG recording (channels, sampling rate, duration).

### Topographic Map
```
GET /api/eeg-topomap/<time_point>
```
Generate topographic map image at specific time point.

**Parameters:**
- `time_point` - Time in seconds

### Power Spectral Density
```
GET /api/eeg-psd
```
Get power spectral density analysis (0-50 Hz).

### Frequency Bands
```
GET /api/eeg-bands
```
Get power in standard EEG frequency bands (Delta, Theta, Alpha, Beta, Gamma).

---

## 🎨 UI Components

Built with **shadcn/ui**, a collection of re-usable components built using Radix UI and Tailwind CSS:

- **Card** - Container for content sections
- **Button** - Interactive buttons with variants
- **Slider** - Time point selection
- **Tabs** - Navigation between different views
- **And more...**

All components are fully customizable and accessible.

---

## 🧪 Technologies Used

### Backend
- **Flask** 3.0 - Lightweight Python web framework
- **MNE-Python** 1.6 - Advanced EEG/MEG analysis
- **NumPy** - Numerical computing
- **Matplotlib** - Plotting library
- **Gunicorn** - Production WSGI server

### Frontend
- **Next.js** 14 - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Plotly.js** - Interactive visualization library
- **Axios** - HTTP client
- **Lucide React** - Beautiful icon set

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 🎯 Roadmap

- [ ] File upload for custom EEG datasets (.edf, .fif formats)
- [ ] Real-time EEG streaming support
- [ ] Advanced filtering options (bandpass, notch, ICA)
- [ ] Event-related potential (ERP) analysis
- [ ] Source localization visualization
- [ ] Export functionality (images, data, reports)
- [ ] User authentication and session management
- [ ] Dark/Light theme toggle

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**A12N4V**

- GitHub: [@A12N4V](https://github.com/A12N4V)
- Project: [Encephalic](https://github.com/A12N4V/Encephalic)

---

## 🙏 Acknowledgments

- [MNE-Python](https://mne.tools/) for the powerful EEG analysis tools
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Plotly](https://plotly.com/) for interactive visualizations

---

<div align="center">

**Made with ❤️ for neuroscience and brain research**

</div>

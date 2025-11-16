# Local Installation Guide

This guide shows you how to install and run Encephalic locally on your machine.

## Method 1: Docker (Recommended) ⭐

This is the easiest method - requires only Docker installed.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/A12N4V/Encephalic.git
   cd Encephalic
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

### First-time Setup Notes
- The first run will take longer as Docker downloads MNE sample data (~2GB)
- Subsequent runs will be much faster using cached data

---

## Method 2: Manual Installation (Development)

For development work, you can run the frontend and backend separately.

### Prerequisites
- Python 3.11 or higher
- Node.js 20 or higher
- Git

### Backend Setup

1. **Clone and navigate**
   ```bash
   git clone https://github.com/A12N4V/Encephalic.git
   cd Encephalic/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv

   # On macOS/Linux:
   source venv/bin/activate

   # On Windows:
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

   This will install:
   - Flask
   - MNE-Python (and download sample data automatically)
   - NumPy, SciPy, Matplotlib
   - Other scientific computing libraries

4. **Run the backend server**
   ```bash
   python run.py
   ```

   The backend will be available at http://localhost:5000

### Frontend Setup

1. **Open new terminal and navigate**
   ```bash
   cd Encephalic/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This installs Next.js, React, shadcn/ui, and all dependencies.

3. **Create environment file**
   ```bash
   cp .env.local.example .env.local
   ```

   Or create `.env.local` with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at http://localhost:3000

---

## Updating to Latest Version

### Docker Method
```bash
cd Encephalic
git pull origin main
docker-compose down
docker-compose up --build
```

### Manual Method
```bash
# Update code
cd Encephalic
git pull origin main

# Update backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Update frontend
cd ../frontend
npm install

# Restart both servers
```

---

## Troubleshooting

### Docker Issues

**"Port already in use"**
```bash
# Check what's using the ports
lsof -i :3000  # macOS/Linux
lsof -i :5000

netstat -ano | findstr :3000  # Windows
netstat -ano | findstr :5000

# Stop conflicting services or change ports in docker-compose.yml
```

**"Cannot connect to Docker daemon"**
- Make sure Docker Desktop is running
- On Linux, ensure your user is in the `docker` group

**"Container won't start"**
```bash
# View logs
docker-compose logs backend
docker-compose logs frontend

# Complete reset
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Manual Installation Issues

**"Module not found" errors**
```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**"CORS errors" in browser**
- Ensure backend is running on port 5000
- Check `.env.local` has correct API URL
- Clear browser cache

**MNE data download fails**
```bash
# Manually download MNE sample data
python -c "import mne; mne.datasets.sample.data_path()"
```

---

## Development Tips

### Hot Reload
- Frontend: Next.js automatically reloads on file changes
- Backend: Flask debug mode reloads on .py file changes

### Viewing Logs
```bash
# Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Manual
# Logs appear in the terminal where you ran the servers
```

### API Testing
```bash
# Test backend health
curl http://localhost:5000/api/health

# Get EEG data
curl http://localhost:5000/api/eeg-data

# Save heatmap
curl http://localhost:5000/api/eeg-heatmap/1.0 --output heatmap.png
```

### Building for Production

**Frontend**
```bash
cd frontend
npm run build
npm start
```

**Backend**
```bash
cd backend
gunicorn --bind 0.0.0.0:5000 --workers 4 run:app
```

---

## System Requirements

### Docker Method
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 5GB free space (for Docker images and MNE data)
- **OS**: Windows 10/11, macOS 10.15+, or Linux

### Manual Method
- **RAM**: 4GB minimum
- **Disk**: 3GB free space (for MNE sample data)
- **OS**: Windows, macOS, or Linux

---

## Additional Resources

- [MNE-Python Documentation](https://mne.tools/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Project README](README.md)

---

## Getting Help

If you encounter issues:
1. Check the Troubleshooting section above
2. Search [GitHub Issues](https://github.com/A12N4V/Encephalic/issues)
3. Create a new issue with:
   - Your OS and version
   - Installation method (Docker or Manual)
   - Error messages and logs
   - Steps to reproduce

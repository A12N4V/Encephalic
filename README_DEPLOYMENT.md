# Encephalic Deployment Guide

## Architecture Overview

Encephalic is a comprehensive EEG analysis platform with:

- **Backend**: Django + MNE-Python for EEG processing
- **Frontend**: Next.js + shadcn/ui for terminal-style visualization
- **Design**: Professional analysis terminal interface

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/health
```

### Manual Setup

#### Backend (Django)

```bash
cd backend_django

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python manage.py runserver 0.0.0.0:8000

# Or use Gunicorn for production
gunicorn --bind 0.0.0.0:8000 --workers 4 encephalic.wsgi:application
```

#### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Environment Variables

### Backend (.env)

```env
DEBUG=False
DJANGO_SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Performance Optimizations

### Backend Optimizations

1. **Django Cache**: In-memory caching (can upgrade to Redis)
   - EEG info cached for 1 hour
   - Topomaps cached for 5 minutes
   - PSD computations cached for 10 minutes

2. **GZip Compression**: Automatic compression for JSON responses

3. **Optimized MNE Processing**:
   - LRU cache for raw data loading
   - Windowed data fetching
   - Reused PSD computations

### Frontend Optimizations

1. **Modular Components**: Separated into 5 specialized panels
2. **Custom Hooks**: Dedicated data fetching hooks with error handling
3. **Debounced Requests**: 200ms debounce for topomap slider
4. **Memoized Rendering**: React.useMemo for expensive plot data
5. **Lazy Loading**: Dynamic imports for Plotly.js

## API Endpoints

### Health Check
```
GET /api/health
```

### EEG Info
```
GET /api/eeg-info
Response: {n_channels, channel_names, sampling_freq, duration, n_samples}
```

### EEG Data (Time Window)
```
GET /api/eeg-data?tmin=0&tmax=10
Response: {labels, data, times, sfreq}
```

### Topographic Map
```
GET /api/eeg-topomap/<time_point>
Response: PNG image
```

### Power Spectral Density
```
GET /api/eeg-psd
Response: {frequencies, psd, channel_psds, channel_names}
```

### Frequency Bands
```
GET /api/eeg-bands
Response: {delta, theta, alpha, beta, gamma}
```

## Performance Metrics

### Expected Improvements (vs Flask version)

- **Loading Time**: 5-10x faster (cached responses)
- **Bundle Size**: ~40% reduction (optimized components)
- **Memory Usage**: 60% reduction (windowed data fetching)
- **Topomap Generation**: 10x reduction in requests (debouncing)

## Upgrading to Redis (Production)

Edit `backend_django/encephalic/settings.py`:

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'encephalic',
        'TIMEOUT': 3600,
    }
}
```

Install Redis dependencies:
```bash
pip install django-redis redis
```

Add Redis to docker-compose.yml:
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - encephalic-network
```

## Monitoring

### Backend Logs
```bash
# Docker
docker-compose logs -f backend

# Manual
# Logs are printed to stdout with structured formatting
```

### Frontend Logs
```bash
# Docker
docker-compose logs -f frontend

# Manual
# Browser console + Next.js server logs
```

## Troubleshooting

### Backend Issues

**MNE Data Not Found**
```bash
# The first run will download MNE sample data (~1.5GB)
# This happens automatically, be patient
```

**Port Already in Use**
```bash
# Change port in docker-compose.yml or kill existing process
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

**API Connection Failed**
```bash
# Verify backend is running
curl http://localhost:8000/api/health

# Check NEXT_PUBLIC_API_URL in .env.local
```

## License

MIT License - See LICENSE file for details

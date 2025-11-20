/**
 * Custom hook for EEG data management with optimized fetching and caching
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import axios, { AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Configure axios defaults
axios.defaults.timeout = 30000 // 30 second timeout

/**
 * Helper function to retry requests with exponential backoff
 */
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn()
    } catch (error) {
      lastError = error as Error
      const axiosError = error as AxiosError

      // If it's a 503 (service initializing), retry with longer delay
      if (axiosError.response?.status === 503 && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.log(`Backend initializing, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      // For other errors, don't retry
      if (attempt === maxRetries || axiosError.response?.status !== 503) {
        throw lastError
      }
    }
  }

  throw lastError
}

/**
 * Hook to check backend health and initialization status
 */
export function useBackendHealth() {
  const [isHealthy, setIsHealthy] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/health`)
        const data = response.data

        if (data.status === 'healthy' && data.data_loaded) {
          setIsHealthy(true)
          setIsInitializing(false)
        } else if (data.status === 'initializing') {
          setIsInitializing(true)
          // Check again in 2 seconds
          setTimeout(checkHealth, 2000)
        } else {
          setIsHealthy(false)
          setIsInitializing(false)
        }
        setError(null)
      } catch (err) {
        setError(err as Error)
        setIsHealthy(false)
        // Retry in 3 seconds on error
        setTimeout(checkHealth, 3000)
      }
    }

    checkHealth()
  }, [])

  return { isHealthy, isInitializing, error }
}

export interface EEGInfo {
  n_channels: number
  channel_names: string[]
  sampling_freq: number
  sfreq: number
  duration: number
  n_samples: number
}

export interface EEGData {
  labels: string[]
  data: number[][]
  times: number[]
  sfreq: number
}

export interface PSDData {
  frequencies: number[]
  psd: number[]
  channel_psds: number[][]
  channel_names: string[]
}

export interface BandData {
  delta: number
  theta: number
  alpha: number
  beta: number
  gamma: number
}

export function useEEGInfo() {
  const [data, setData] = useState<EEGInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true)
        const response = await fetchWithRetry(() =>
          axios.get(`${API_URL}/api/eeg-info`)
        )
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching EEG info:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInfo()
  }, [])

  return { data, loading, error }
}

export function useEEGData(tmin: number = 0, tmax: number = 10) {
  const [data, setData] = useState<EEGData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetchWithRetry(() =>
          axios.get(`${API_URL}/api/eeg-data`, {
            params: { tmin, tmax }
          })
        )
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching EEG data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tmin, tmax])

  return { data, loading, error }
}

export function usePSDData() {
  const [data, setData] = useState<PSDData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchPSD = async () => {
      try {
        setLoading(true)
        const response = await fetchWithRetry(() =>
          axios.get(`${API_URL}/api/eeg-psd`)
        )
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching PSD:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPSD()
  }, [])

  return { data, loading, error }
}

export function useBandData() {
  const [data, setData] = useState<BandData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBands = async () => {
      try {
        setLoading(true)
        const response = await fetchWithRetry(() =>
          axios.get(`${API_URL}/api/eeg-bands`)
        )
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching frequency bands:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBands()
  }, [])

  return { data, loading, error }
}

/**
 * Debounced topomap fetching hook
 * Prevents excessive requests during slider movement
 */
export function useTopomap(timePoint: number, debounceMs: number = 200) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const currentUrlRef = useRef<string | null>(null)

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new debounced fetch
    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true)
        const response = await fetchWithRetry(() =>
          axios.get(`${API_URL}/api/eeg-topomap/${timePoint}`, {
            responseType: 'blob',
          })
        )

        // Revoke previous URL to prevent memory leaks
        if (currentUrlRef.current) {
          URL.revokeObjectURL(currentUrlRef.current)
        }

        const url = URL.createObjectURL(response.data)
        currentUrlRef.current = url
        setImageUrl(url)
        setError(null)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching topomap:', err)
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [timePoint, debounceMs])

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current)
      }
    }
  }, [])

  return { imageUrl, loading, error }
}

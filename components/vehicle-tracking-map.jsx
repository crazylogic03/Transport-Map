"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "../app/styles.css"

// Mock data to use when API is unavailable
const MOCK_LOCATIONS = [
  { id: "1", latitude: 17.385044, longitude: 78.486671, timestamp: "2023-01-01T10:00:00Z" },
  { id: "2", latitude: 17.388044, longitude: 78.489671, timestamp: "2023-01-01T10:01:00Z" },
  { id: "3", latitude: 17.391044, longitude: 78.492671, timestamp: "2023-01-01T10:02:00Z" },
  { id: "4", latitude: 17.394044, longitude: 78.495671, timestamp: "2023-01-01T10:03:00Z" },
  { id: "5", latitude: 17.397044, longitude: 78.498671, timestamp: "2023-01-01T10:04:00Z" },
  { id: "6", latitude: 17.400044, longitude: 78.501671, timestamp: "2023-01-01T10:05:00Z" },
]

// Component to recenter the map when the vehicle moves
function MapRecenter({ position }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [position, map])

  return null
}

export default function VehicleTrackingMap() {
  const [locations, setLocations] = useState([])
  const [currentLocation, setCurrentLocation] = useState([17.385044, 78.486671])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useMockData, setUseMockData] = useState(false)
  const pollingIntervalRef = useRef(null)
  const mockDataIndexRef = useRef(0)
  const [mapReady, setMapReady] = useState(false)

  // Initialize vehicle icon only on client side
  const vehicleIcon = useRef(null)

  useEffect(() => {
    // Initialize Leaflet icon only on client side
    vehicleIcon.current = new L.Icon({
      iconUrl: "/vehicle-icon.svg",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    })

    setMapReady(true)
  }, [])

  // Function to fetch location data from the Pocketbase API
  const fetchLocationData = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/collections/locations/records", {
        // Add a timeout to prevent long waiting times if server is down
        signal: AbortSignal.timeout(3000),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch location data")
      }

      const data = await response.json()

      if (data && data.items && Array.isArray(data.items)) {
        // Sort locations by timestamp to ensure correct route order
        const sortedLocations = data.items.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )

        setLocations(sortedLocations)

        // Update current location to the latest one
        if (sortedLocations.length > 0) {
          const latest = sortedLocations[sortedLocations.length - 1]
          setCurrentLocation([latest.latitude, latest.longitude])
        }
      }

      setIsLoading(false)
      setUseMockData(false)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to connect to the server. Using mock data instead.")
      setUseMockData(true)
      setIsLoading(false)
    }
  }

  // Function to simulate vehicle movement with mock data
  const updateWithMockData = () => {
    // Use mock data and cycle through it
    const index = mockDataIndexRef.current % MOCK_LOCATIONS.length
    const mockLocation = MOCK_LOCATIONS[index]

    // Update current location
    setCurrentLocation([mockLocation.latitude, mockLocation.longitude])

    // Update locations array for the route
    setLocations((prevLocations) => {
      // Only add new locations to avoid duplicates
      if (!prevLocations.find((loc) => loc.id === mockLocation.id)) {
        return [...prevLocations, mockLocation]
      }
      return prevLocations
    })

    // Increment index for next update
    mockDataIndexRef.current += 1
  }

  // Set up polling interval to fetch location data every 2 seconds
  useEffect(() => {
    if (!mapReady) return

    // Fetch data immediately on mount
    fetchLocationData().catch(() => {
      setUseMockData(true)
      setError("Failed to connect to the server. Using mock data instead.")
      setIsLoading(false)
    })

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      if (useMockData) {
        updateWithMockData()
      } else {
        fetchLocationData()
      }
    }, 2000)

    // Clean up interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [useMockData, mapReady])

  // Convert locations to polyline points
  const routePoints = locations.map((loc) => [loc.latitude, loc.longitude])

  if (!mapReady) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="map-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <MapContainer center={currentLocation} zoom={15} style={{ height: "100%", width: "100%" }} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Vehicle marker */}
        <Marker position={currentLocation} icon={vehicleIcon.current}></Marker>

        {/* Route polyline */}
        {routePoints.length > 1 && <Polyline positions={routePoints} color="#3B82F6" weight={4} opacity={0.7} />}

        {/* Recenter map when vehicle moves */}
        <MapRecenter position={currentLocation} />
      </MapContainer>

      <div className="info-panel bottom-right">
        <h3 className="info-title">Vehicle Tracking</h3>
        <p className="info-text">
          Lat: {currentLocation[0].toFixed(6)}, Lng: {currentLocation[1].toFixed(6)}
        </p>
        {useMockData && <p className="mock-data-text">Using simulated data</p>}
      </div>

      <div className="info-panel top-left">
        <h3 className="info-title">Vehicle Tracker</h3>
        <p className="info-text">{useMockData ? "Simulating vehicle movement" : "Tracking real-time data"}</p>
        {useMockData && (
          <button onClick={() => fetchLocationData()} className="reconnect-button">
            Try reconnect
          </button>
        )}
      </div>
    </div>
  )
}

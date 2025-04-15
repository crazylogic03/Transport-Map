// This is a script to generate sample location data for Pocketbase
// You would run this separately after setting up Pocketbase

import fetch from "node-fetch"

// Default center location (Hyderabad, India)
const CENTER_LAT = 17.385044
const CENTER_LNG = 78.486671

// Generate a route that moves in a circular pattern
function generateRoutePoints(count = 20, radiusKm = 0.5) {
  const points = []
  const earthRadius = 6371 // Earth's radius in km

  for (let i = 0; i < count; i++) {
    // Calculate position on circle
    const angle = (i / count) * 2 * Math.PI
    const dx = radiusKm * Math.cos(angle)
    const dy = radiusKm * Math.sin(angle)

    // Convert dx/dy to lat/lng
    const lat = CENTER_LAT + (dy / earthRadius) * (180 / Math.PI)
    const lng = CENTER_LNG + ((dx / earthRadius) * (180 / Math.PI)) / Math.cos((CENTER_LAT * Math.PI) / 180)

    points.push({ lat, lng })
  }

  return points
}

async function createSampleData() {
  const POCKETBASE_URL = "http://localhost:8090"
  const routePoints = generateRoutePoints(20)

  console.log("Generating sample location data...")

  // Create records with timestamps spaced 2 minutes apart
  const now = new Date()

  for (let i = 0; i < routePoints.length; i++) {
    const point = routePoints[i]
    const timestamp = new Date(now.getTime() - (routePoints.length - i) * 2 * 60 * 1000)

    const locationData = {
      latitude: point.lat,
      longitude: point.lng,
      timestamp: timestamp.toISOString(),
      speed: 30 + Math.random() * 20, // Random speed between 30-50 km/h
      heading: (i / routePoints.length) * 360, // Heading in degrees
    }

    try {
      const response = await fetch(`${POCKETBASE_URL}/api/collections/locations/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`Failed to create record ${i + 1}:`, errorData)
        continue
      }

      console.log(`Created record ${i + 1}/${routePoints.length}`)
    } catch (error) {
      console.error(`Error creating record ${i + 1}:`, error)
    }
  }

  console.log("Sample data generation complete!")
}

// Run the function
createSampleData().catch(console.error)

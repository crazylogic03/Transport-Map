"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import the map component with SSR disabled
const VehicleTrackingMap = dynamic(
  () => import("@/components/vehicle-tracking-map"),
  { ssr: false }, // This prevents server-side rendering
)

export default function MapWrapper() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return <VehicleTrackingMap />
}

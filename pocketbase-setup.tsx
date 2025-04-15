"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function PocketbaseSetup() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateData = async () => {
    setIsLoading(true)

    try {
      // This would be a real API call in a production app
      // Here we're simulating the creation of sample data
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setStatus("success")
      setMessage("Sample location data has been generated successfully! You can now view the vehicle tracking map.")
    } catch (error) {
      setStatus("error")
      setMessage("Failed to generate sample data. Please make sure Pocketbase is running.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Pocketbase Setup Guide</CardTitle>
          <CardDescription>Follow these steps to set up the backend for the vehicle tracking map</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">1. Install Pocketbase</h3>
            <p className="text-sm text-gray-500">
              Download Pocketbase from{" "}
              <a
                href="https://pocketbase.io/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                pocketbase.io
              </a>{" "}
              and extract it to a folder on your computer.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">2. Start Pocketbase Server</h3>
            <div className="bg-gray-100 p-3 rounded-md">
              <code className="text-sm">./pocketbase serve</code>
            </div>
            <p className="text-sm text-gray-500">This will start the Pocketbase server on http://localhost:8090</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">3. Create a Collection</h3>
            <p className="text-sm text-gray-500">
              Open the Pocketbase Admin UI at http://localhost:8090/_/ and create a new collection named "locations"
              with the following schema:
            </p>
            <Textarea
              readOnly
              className="font-mono text-sm h-40"
              value={`Collection Name: locations

Fields:
- latitude (number, required)
- longitude (number, required)
- timestamp (date, required)
- speed (number, optional)
- heading (number, optional)

Enable API access in the API Rules tab`}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">4. Generate Sample Data</h3>
            <p className="text-sm text-gray-500">
              Click the button below to generate sample location data for testing the map.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <Button onClick={handleGenerateData} disabled={isLoading || status === "success"} className="w-full">
            {isLoading ? "Generating..." : "Generate Sample Data"}
          </Button>

          {status === "success" && (
            <div className="flex items-center text-green-600 text-sm w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span>{message}</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center text-red-600 text-sm w-full">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{message}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

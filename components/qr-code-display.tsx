"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Download } from "lucide-react"

interface QRCodeDisplayProps {
  qrCode: string
  reservationId: number
  onClose: () => void
}

export default function QRCodeDisplay({ qrCode, reservationId, onClose }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  useEffect(() => {
    // Génération du QR code avec une API publique
    const generateQRCode = () => {
      const qrData = `RESERVATION:${reservationId}:${qrCode}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
      setQrCodeUrl(qrUrl)
    }

    generateQRCode()
  }, [qrCode, reservationId])

  const handleDownload = async () => {
    if (qrCodeUrl) {
      try {
        const response = await fetch(qrCodeUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `qr-code-reservation-${reservationId}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error("Erreur lors du téléchargement:", error)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>QR Code de réservation</CardTitle>
              <CardDescription>Présentez ce code lors du retrait du véhicule</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {qrCodeUrl && (
            <div className="flex justify-center">
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt={`QR Code pour la réservation ${reservationId}`}
                className="border rounded-lg"
                width={300}
                height={300}
              />
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p className="font-medium">Code de réservation</p>
            <p className="font-mono bg-gray-100 p-2 rounded">{qrCode}</p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

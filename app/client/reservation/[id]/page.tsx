"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Car, MapPin, Shield, Baby, UserPlus, Download, QrCode, ArrowLeft } from "lucide-react"
import { getCurrentUser, getReservationById, getVehiculeById, getClientById } from "@/mocks/mock"
import type { User, Reservation, Vehicule, Client } from "@/types"
import QRCodeDisplay from "@/components/qr-code-display"

export default function ReservationDetails() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [vehicule, setVehicule] = useState<Vehicule | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "client") {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      if (params.id && currentUser.clientId) {
        const reservationId = Number.parseInt(params.id as string)
        const [reservationData, clientData] = await Promise.all([
          getReservationById(reservationId),
          getClientById(currentUser.clientId),
        ])

        if (reservationData && reservationData.clientId === currentUser.clientId) {
          setReservation(reservationData)
          setClient(clientData)

          const vehiculeData = await getVehiculeById(reservationData.vehiculeId)
          setVehicule(vehiculeData)
        }
      }
      setLoading(false)
    }

    loadData()
  }, [params.id, router])

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "confirmee":
        return "bg-green-100 text-green-800"
      case "en_cours":
        return "bg-blue-100 text-blue-800"
      case "terminee":
        return "bg-gray-100 text-gray-800"
      case "annulee":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "confirmee":
        return "Confirmée"
      case "en_cours":
        return "En cours"
      case "terminee":
        return "Terminée"
      case "annulee":
        return "Annulée"
      default:
        return statut
    }
  }

  const calculateDays = () => {
    if (!reservation) return 0
    const debut = new Date(reservation.dateDebut)
    const fin = new Date(reservation.dateFin)
    return Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!reservation || !vehicule || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Réservation non trouvée</h1>
          <Link href="/client/reservations">
            <Button>Retour aux réservations</Button>
          </Link>
        </div>
      </div>
    )
  }

  const jours = calculateDays()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/client/reservations" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux réservations
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Réservation #{reservation.id}</h1>
              <p className="text-lg text-gray-600">
                Réservée le {new Date(reservation.dateReservation).toLocaleDateString()}
              </p>
            </div>
            <Badge className={`px-3 py-1 text-sm ${getStatusColor(reservation.statut)}`}>
              {getStatusLabel(reservation.statut)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Véhicule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Véhicule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {vehicule.marque} {vehicule.modele}
                    </h3>
                    <p className="text-gray-600 capitalize">{vehicule.categorie}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {vehicule.carburant} • {vehicule.transmission} • {vehicule.places} places
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{vehicule.prixJournalier}€</p>
                    <p className="text-sm text-gray-600">par jour</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates et durée */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Période de location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date de début</p>
                    <p className="text-lg font-semibold">{new Date(reservation.dateDebut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date de fin</p>
                    <p className="text-lg font-semibold">{new Date(reservation.dateFin).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Durée</p>
                    <p className="text-lg font-semibold">
                      {jours} jour{jours > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle>Options sélectionnées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reservation.options.gps && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                      <span>GPS</span>
                    </div>
                  )}
                  {reservation.options.assuranceComplete && (
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-green-600 mr-2" />
                      <span>Assurance complète</span>
                    </div>
                  )}
                  {reservation.options.siegeEnfant && (
                    <div className="flex items-center">
                      <Baby className="h-4 w-4 text-purple-600 mr-2" />
                      <span>Siège enfant</span>
                    </div>
                  )}
                  {reservation.options.conducteurSupplementaire && (
                    <div className="flex items-center">
                      <UserPlus className="h-4 w-4 text-orange-600 mr-2" />
                      <span>Conducteur supplémentaire</span>
                    </div>
                  )}
                  {!Object.values(reservation.options).some(Boolean) && (
                    <p className="text-gray-500 italic">Aucune option sélectionnée</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Récapitulatif financier */}
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>
                      Location ({jours} jour{jours > 1 ? "s" : ""})
                    </span>
                    <span>{vehicule.prixJournalier * jours}€</span>
                  </div>
                  {reservation.options.gps && (
                    <div className="flex justify-between">
                      <span>GPS</span>
                      <span>{5 * jours}€</span>
                    </div>
                  )}
                  {reservation.options.assuranceComplete && (
                    <div className="flex justify-between">
                      <span>Assurance complète</span>
                      <span>{15 * jours}€</span>
                    </div>
                  )}
                  {reservation.options.siegeEnfant && (
                    <div className="flex justify-between">
                      <span>Siège enfant</span>
                      <span>{8 * jours}€</span>
                    </div>
                  )}
                  {reservation.options.conducteurSupplementaire && (
                    <div className="flex justify-between">
                      <span>Conducteur supplémentaire</span>
                      <span>{10 * jours}€</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{reservation.prixTotal}€</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowQR(true)}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Afficher QR Code
                </Button>

                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger contrat
                </Button>

                {reservation.statut === "terminee" && (
                  <Link href={`/client/avis/${reservation.id}`} className="w-full">
                    <Button className="w-full">Laisser un avis</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle>Informations client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Nom :</span> {client.prenom} {client.nom}
                  </div>
                  <div>
                    <span className="font-medium">Email :</span> {client.email}
                  </div>
                  <div>
                    <span className="font-medium">Téléphone :</span> {client.telephone}
                  </div>
                  <div>
                    <span className="font-medium">Permis :</span> {client.numeroPermis}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal QR Code */}
        {showQR && (
          <QRCodeDisplay qrCode={reservation.qrCode} reservationId={reservation.id} onClose={() => setShowQR(false)} />
        )}
      </div>
    </div>
  )
}

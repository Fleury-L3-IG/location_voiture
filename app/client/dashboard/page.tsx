"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Car, CreditCard, Star, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { getCurrentUser, getClientById, getReservationsByClientId, getVehicules } from "@/mocks/mock"
import type { User, Client, Reservation, Vehicule } from "@/types"

export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "client") {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      if (currentUser.clientId) {
        const [clientData, reservationsData, vehiculesData] = await Promise.all([
          getClientById(currentUser.clientId),
          getReservationsByClientId(currentUser.clientId),
          getVehicules(),
        ])

        setClient(clientData)
        setReservations(reservationsData)
        setVehicules(vehiculesData)
      }
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <Link href="/connexion">
            <Button>Retour à la connexion</Button>
          </Link>
        </div>
      </div>
    )
  }

  const reservationsActives = reservations.filter((r) => r.statut === "confirmee" || r.statut === "en_cours")
  const reservationsTerminees = reservations.filter((r) => r.statut === "terminee")

  const getVehiculeById = (id: number) => vehicules.find((v) => v.id === id)

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "confirmee":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "en_cours":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "terminee":
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      case "annulee":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bonjour {client.prenom} !</h1>
          <p className="text-lg text-gray-600">Bienvenue dans votre espace personnel</p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Réservations</p>
                  <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Actives</p>
                  <p className="text-2xl font-bold text-gray-900">{reservationsActives.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Points fidélité</p>
                  <p className="text-2xl font-bold text-gray-900">{client.pointsFidelite}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-gray-900">{reservationsTerminees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Réservations récentes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Mes réservations</CardTitle>
                  <CardDescription>Vos dernières réservations</CardDescription>
                </div>
                <Link href="/client/reservations">
                  <Button variant="outline" size="sm">
                    Voir tout
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {reservations.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Aucune réservation</p>
                  <Link href="/catalogue">
                    <Button>Réserver un véhicule</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.slice(0, 3).map((reservation) => {
                    const vehicule = getVehiculeById(reservation.vehiculeId)
                    return (
                      <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            {getStatusIcon(reservation.statut)}
                            <Badge variant="outline" className="ml-2">
                              {getStatusLabel(reservation.statut)}
                            </Badge>
                          </div>
                          <div>
                            <p className="font-medium">
                              {vehicule ? `${vehicule.marque} ${vehicule.modele}` : "Véhicule inconnu"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(reservation.dateDebut).toLocaleDateString()} -{" "}
                              {new Date(reservation.dateFin).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{reservation.prixTotal}€</p>
                          <Link href={`/client/reservation/${reservation.id}`}>
                            <Button variant="ghost" size="sm">
                              Détails
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/catalogue">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Car className="h-4 w-4 mr-2" />
                    Réserver un véhicule
                  </Button>
                </Link>

                <Link href="/client/reservations">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Mes réservations
                  </Button>
                </Link>

                <Link href="/client/factures">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Mes factures
                  </Button>
                </Link>

                <Link href="/client/profil">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Mon profil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Programme de fidélité */}
        {client.pointsFidelite > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                Programme de fidélité
              </CardTitle>
              <CardDescription>Vous avez {client.pointsFidelite} points de fidélité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  Vos points peuvent être utilisés pour obtenir des réductions sur vos prochaines réservations.
                </p>
                <p className="text-xs text-gray-600">100 points = 10€ de réduction</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

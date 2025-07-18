"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Calendar, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { getCurrentUser, getVehicules, getClients, getReservations, getPaiements } from "@/mocks/mock"
import type { User, Vehicule, Client, Reservation, Paiement } from "@/types"
import Sidebar from "@/components/sidebar"

export default function DashboardAdmin() {
  const [user, setUser] = useState<User | null>(null)
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "employe")) {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      const [vehiculesData, clientsData, reservationsData, paiementsData] = await Promise.all([
        getVehicules(),
        getClients(),
        getReservations(),
        getPaiements(),
      ])

      setVehicules(vehiculesData)
      setClients(clientsData)
      setReservations(reservationsData)
      setPaiements(paiementsData)
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

  // Calculs des statistiques
  const vehiculesDisponibles = vehicules.filter((v) => v.disponible).length
  const reservationsActives = reservations.filter((r) => r.statut === "confirmee" || r.statut === "en_cours").length
  const chiffreAffaires = paiements.filter((p) => p.statut === "paye").reduce((sum, p) => sum + p.montant, 0)
  const tauxOccupation =
    vehicules.length > 0 ? Math.round(((vehicules.length - vehiculesDisponibles) / vehicules.length) * 100) : 0

  const reservationsParStatut = {
    confirmee: reservations.filter((r) => r.statut === "confirmee").length,
    en_cours: reservations.filter((r) => r.statut === "en_cours").length,
    terminee: reservations.filter((r) => r.statut === "terminee").length,
    annulee: reservations.filter((r) => r.statut === "annulee").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord administrateur</h1>
            <p className="text-lg text-gray-600">Vue d'ensemble de votre agence de location</p>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Car className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Véhicules</p>
                    <p className="text-2xl font-bold text-gray-900">{vehicules.length}</p>
                    <p className="text-xs text-gray-500">{vehiculesDisponibles} disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                    <p className="text-xs text-gray-500">Total inscrits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Réservations</p>
                    <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
                    <p className="text-xs text-gray-500">{reservationsActives} actives</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold text-gray-900">{chiffreAffaires.toLocaleString()}€</p>
                    <p className="text-xs text-gray-500">Total encaissé</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Taux d'occupation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Taux d'occupation
                </CardTitle>
                <CardDescription>Pourcentage de véhicules loués</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{tauxOccupation}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${tauxOccupation}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {vehicules.length - vehiculesDisponibles} véhicules sur {vehicules.length} en location
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Réservations par statut */}
            <Card>
              <CardHeader>
                <CardTitle>Réservations par statut</CardTitle>
                <CardDescription>Répartition des réservations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Confirmées</span>
                    </div>
                    <span className="font-semibold">{reservationsParStatut.confirmee}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm">En cours</span>
                    </div>
                    <span className="font-semibold">{reservationsParStatut.en_cours}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">Terminées</span>
                    </div>
                    <span className="font-semibold">{reservationsParStatut.terminee}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm">Annulées</span>
                    </div>
                    <span className="font-semibold">{reservationsParStatut.annulee}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Réservations récentes */}
          <Card>
            <CardHeader>
              <CardTitle>Réservations récentes</CardTitle>
              <CardDescription>Les dernières réservations effectuées</CardDescription>
            </CardHeader>
            <CardContent>
              {reservations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune réservation</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Client</th>
                        <th className="text-left py-2">Véhicule</th>
                        <th className="text-left py-2">Dates</th>
                        <th className="text-left py-2">Statut</th>
                        <th className="text-left py-2">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.slice(0, 5).map((reservation) => {
                        const client = clients.find((c) => c.id === reservation.clientId)
                        const vehicule = vehicules.find((v) => v.id === reservation.vehiculeId)
                        return (
                          <tr key={reservation.id} className="border-b">
                            <td className="py-2">{client ? `${client.prenom} ${client.nom}` : "Client inconnu"}</td>
                            <td className="py-2">
                              {vehicule ? `${vehicule.marque} ${vehicule.modele}` : "Véhicule inconnu"}
                            </td>
                            <td className="py-2 text-sm">
                              {new Date(reservation.dateDebut).toLocaleDateString()} -{" "}
                              {new Date(reservation.dateFin).toLocaleDateString()}
                            </td>
                            <td className="py-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  reservation.statut === "confirmee"
                                    ? "bg-green-100 text-green-800"
                                    : reservation.statut === "en_cours"
                                      ? "bg-blue-100 text-blue-800"
                                      : reservation.statut === "terminee"
                                        ? "bg-gray-100 text-gray-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {reservation.statut === "confirmee"
                                  ? "Confirmée"
                                  : reservation.statut === "en_cours"
                                    ? "En cours"
                                    : reservation.statut === "terminee"
                                      ? "Terminée"
                                      : "Annulée"}
                              </span>
                            </td>
                            <td className="py-2 font-semibold">{reservation.prixTotal}€</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

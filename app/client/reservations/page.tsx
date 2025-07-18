"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Car, Clock, CheckCircle, AlertCircle, Search } from "lucide-react"
import { getCurrentUser, getClientById, getReservationsByClientId, getVehicules } from "@/mocks/mock"
import type { User, Client, Reservation, Vehicule } from "@/types"

export default function MesReservations() {
  const [user, setUser] = useState<User | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    statut: "all",
    recherche: "",
  })
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
        setFilteredReservations(reservationsData)
      }
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    const filtered = reservations.filter((reservation) => {
      const matchStatut = filters.statut === "all" || reservation.statut === filters.statut
      const vehicule = vehicules.find((v) => v.id === reservation.vehiculeId)
      const matchRecherche =
        !filters.recherche ||
        (vehicule && `${vehicule.marque} ${vehicule.modele}`.toLowerCase().includes(filters.recherche.toLowerCase()))

      return matchStatut && matchRecherche
    })

    setFilteredReservations(filtered)
  }, [filters, reservations, vehicules])

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

  const getStatusVariant = (statut: string) => {
    switch (statut) {
      case "confirmee":
        return "default"
      case "en_cours":
        return "secondary"
      case "terminee":
        return "outline"
      case "annulee":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes réservations</h1>
          <p className="text-lg text-gray-600">Gérez toutes vos réservations de véhicules</p>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rechercher</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Marque, modèle..."
                    value={filters.recherche}
                    onChange={(e) => setFilters((prev) => ({ ...prev, recherche: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Statut</label>
                <Select
                  value={filters.statut}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, statut: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="confirmee">Confirmées</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="terminee">Terminées</SelectItem>
                    <SelectItem value="annulee">Annulées</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ statut: "all", recherche: "" })}
                  className="w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold">{reservations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Confirmées</p>
                  <p className="text-xl font-bold">{reservations.filter((r) => r.statut === "confirmee").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-xl font-bold">{reservations.filter((r) => r.statut === "en_cours").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Terminées</p>
                  <p className="text-xl font-bold">{reservations.filter((r) => r.statut === "terminee").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des réservations */}
        {filteredReservations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune réservation trouvée</h3>
              <p className="text-gray-600 mb-6">
                {reservations.length === 0
                  ? "Vous n'avez pas encore effectué de réservation."
                  : "Aucune réservation ne correspond à vos critères de recherche."}
              </p>
              <Link href="/catalogue">
                <Button>Réserver un véhicule</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => {
              const vehicule = getVehiculeById(reservation.vehiculeId)
              return (
                <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                        <div className="flex-shrink-0">{getStatusIcon(reservation.statut)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold">
                              {vehicule ? `${vehicule.marque} ${vehicule.modele}` : "Véhicule inconnu"}
                            </h3>
                            <Badge variant={getStatusVariant(reservation.statut) as any}>
                              {getStatusLabel(reservation.statut)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">
                            Réservation #{reservation.id} • {new Date(reservation.dateReservation).toLocaleDateString()}
                          </p>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(reservation.dateDebut).toLocaleDateString()} -{" "}
                              {new Date(reservation.dateFin).toLocaleDateString()}
                            </div>
                            <div className="font-semibold text-blue-600">{reservation.prixTotal}€</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link href={`/client/reservation/${reservation.id}`}>
                          <Button variant="outline" size="sm">
                            Détails
                          </Button>
                        </Link>
                        {reservation.statut === "terminee" && (
                          <Link href={`/client/avis/${reservation.id}`}>
                            <Button size="sm">Laisser un avis</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

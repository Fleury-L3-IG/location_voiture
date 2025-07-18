"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, Eye, Edit, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react"
import { getCurrentUser, getReservations, getClients, getVehicules, updateReservation } from "@/mocks/mock"
import type { User, Reservation, Client, Vehicule } from "@/types"
import Sidebar from "@/components/sidebar"

export default function GestionReservations() {
  const [user, setUser] = useState<User | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [filteredReservations, setFilteredReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    recherche: "",
    statut: "all",
    periode: "all",
  })
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "employe")) {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      const [reservationsData, clientsData, vehiculesData] = await Promise.all([
        getReservations(),
        getClients(),
        getVehicules(),
      ])

      setReservations(reservationsData)
      setClients(clientsData)
      setVehicules(vehiculesData)

      // Enrichir les réservations
      const reservationsEnrichies = reservationsData.map((reservation) => {
        const client = clientsData.find((c) => c.id === reservation.clientId)
        const vehicule = vehiculesData.find((v) => v.id === reservation.vehiculeId)
        return {
          ...reservation,
          client,
          vehicule,
        }
      })

      setFilteredReservations(reservationsEnrichies)
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    const reservationsEnrichies = reservations.map((reservation) => {
      const client = clients.find((c) => c.id === reservation.clientId)
      const vehicule = vehicules.find((v) => v.id === reservation.vehiculeId)
      return {
        ...reservation,
        client,
        vehicule,
      }
    })

    const filtered = reservationsEnrichies.filter((reservation) => {
      const matchRecherche =
        !filters.recherche ||
        reservation.id.toString().includes(filters.recherche) ||
        (reservation.client &&
          `${reservation.client.prenom} ${reservation.client.nom}`
            .toLowerCase()
            .includes(filters.recherche.toLowerCase())) ||
        (reservation.vehicule &&
          `${reservation.vehicule.marque} ${reservation.vehicule.modele}`
            .toLowerCase()
            .includes(filters.recherche.toLowerCase()))

      const matchStatut = filters.statut === "all" || reservation.statut === filters.statut

      const matchPeriode =
        filters.periode === "all" ||
        (() => {
          const dateReservation = new Date(reservation.dateReservation)
          const maintenant = new Date()
          const diffJours = (maintenant.getTime() - dateReservation.getTime()) / (1000 * 60 * 60 * 24)

          switch (filters.periode) {
            case "7j":
              return diffJours <= 7
            case "30j":
              return diffJours <= 30
            case "90j":
              return diffJours <= 90
            default:
              return true
          }
        })()

      return matchRecherche && matchStatut && matchPeriode
    })

    setFilteredReservations(filtered)
  }, [filters, reservations, clients, vehicules])

  const handleStatusChange = async (reservationId: number, newStatus: string) => {
    try {
      await updateReservation(reservationId, { statut: newStatus as any })
      setReservations((prev) => prev.map((r) => (r.id === reservationId ? { ...r, statut: newStatus as any } : r)))
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
    }
  }

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "confirmee":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "en_cours":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "terminee":
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      case "annulee":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

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

  const getStatistiques = () => {
    return {
      total: filteredReservations.length,
      confirmees: filteredReservations.filter((r) => r.statut === "confirmee").length,
      enCours: filteredReservations.filter((r) => r.statut === "en_cours").length,
      terminees: filteredReservations.filter((r) => r.statut === "terminee").length,
      annulees: filteredReservations.filter((r) => r.statut === "annulee").length,
      chiffreAffaires: filteredReservations
        .filter((r) => r.statut === "terminee")
        .reduce((sum, r) => sum + r.prixTotal, 0),
    }
  }

  const stats = getStatistiques()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des réservations</h1>
            <p className="text-lg text-gray-600">Suivez et gérez toutes les réservations</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold">{stats.total}</p>
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
                    <p className="text-xl font-bold">{stats.confirmees}</p>
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
                    <p className="text-xl font-bold">{stats.enCours}</p>
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
                    <p className="text-xl font-bold">{stats.terminees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Annulées</p>
                    <p className="text-xl font-bold">{stats.annulees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rechercher</label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="ID, client, véhicule..."
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

                <div>
                  <label className="block text-sm font-medium mb-2">Période</label>
                  <Select
                    value={filters.periode}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, periode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les périodes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les périodes</SelectItem>
                      <SelectItem value="7j">7 derniers jours</SelectItem>
                      <SelectItem value="30j">30 derniers jours</SelectItem>
                      <SelectItem value="90j">90 derniers jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ recherche: "", statut: "all", periode: "all" })}
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des réservations */}
          {filteredReservations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune réservation trouvée</h3>
                <p className="text-gray-600">
                  {reservations.length === 0
                    ? "Aucune réservation n'a encore été effectuée."
                    : "Aucune réservation ne correspond à vos critères de recherche."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Réservation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Véhicule
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Période
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReservations.map((reservation) => (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(reservation.statut)}
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">#{reservation.id}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(reservation.dateReservation).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.client
                                ? `${reservation.client.prenom} ${reservation.client.nom}`
                                : "Client inconnu"}
                            </div>
                            <div className="text-sm text-gray-500">{reservation.client?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.vehicule
                                ? `${reservation.vehicule.marque} ${reservation.vehicule.modele}`
                                : "Véhicule inconnu"}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">{reservation.vehicule?.categorie}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{new Date(reservation.dateDebut).toLocaleDateString()}</div>
                            <div className="text-gray-500">au {new Date(reservation.dateFin).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{reservation.prixTotal}€</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select
                              value={reservation.statut}
                              onValueChange={(value) => handleStatusChange(reservation.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <Badge className={`px-2 py-1 text-xs ${getStatusColor(reservation.statut)}`}>
                                  {getStatusLabel(reservation.statut)}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmee">Confirmée</SelectItem>
                                <SelectItem value="en_cours">En cours</SelectItem>
                                <SelectItem value="terminee">Terminée</SelectItem>
                                <SelectItem value="annulee">Annulée</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, CreditCard, Calendar, DollarSign, TrendingUp, Eye } from "lucide-react"
import { getCurrentUser, getPaiements, getReservations, getClients, getVehicules } from "@/mocks/mock"
import type { User, Paiement, Reservation, Client, Vehicule } from "@/types"
import Sidebar from "@/components/sidebar"

export default function GestionPaiements() {
  const [user, setUser] = useState<User | null>(null)
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [filteredPaiements, setFilteredPaiements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    recherche: "",
    statut: "all",
    methode: "all",
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

      const [paiementsData, reservationsData, clientsData, vehiculesData] = await Promise.all([
        getPaiements(),
        getReservations(),
        getClients(),
        getVehicules(),
      ])

      setPaiements(paiementsData)
      setReservations(reservationsData)
      setClients(clientsData)
      setVehicules(vehiculesData)

      // Enrichir les paiements avec les données associées
      const paiementsEnrichis = paiementsData.map((paiement) => {
        const reservation = reservationsData.find((r) => r.id === paiement.reservationId)
        const client = reservation ? clientsData.find((c) => c.id === reservation.clientId) : null
        const vehicule = reservation ? vehiculesData.find((v) => v.id === reservation.vehiculeId) : null
        return {
          ...paiement,
          reservation,
          client,
          vehicule,
        }
      })

      setFilteredPaiements(paiementsEnrichis)
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    const paiementsEnrichis = paiements.map((paiement) => {
      const reservation = reservations.find((r) => r.id === paiement.reservationId)
      const client = reservation ? clients.find((c) => c.id === reservation.clientId) : null
      const vehicule = reservation ? vehicules.find((v) => v.id === reservation.vehiculeId) : null
      return {
        ...paiement,
        reservation,
        client,
        vehicule,
      }
    })

    const filtered = paiementsEnrichis.filter((paiement) => {
      const matchRecherche =
        !filters.recherche ||
        paiement.id.toString().includes(filters.recherche) ||
        (paiement.client &&
          `${paiement.client.prenom} ${paiement.client.nom}`.toLowerCase().includes(filters.recherche.toLowerCase())) ||
        (paiement.vehicule &&
          `${paiement.vehicule.marque} ${paiement.vehicule.modele}`
            .toLowerCase()
            .includes(filters.recherche.toLowerCase()))

      const matchStatut = filters.statut === "all" || paiement.statut === filters.statut
      const matchMethode = filters.methode === "all" || paiement.methodePaiement === filters.methode

      const matchPeriode =
        filters.periode === "all" ||
        (() => {
          const datePaiement = new Date(paiement.datePaiement)
          const maintenant = new Date()
          const diffJours = (maintenant.getTime() - datePaiement.getTime()) / (1000 * 60 * 60 * 24)

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

      return matchRecherche && matchStatut && matchMethode && matchPeriode
    })

    setFilteredPaiements(filtered)
  }, [filters, paiements, reservations, clients, vehicules])

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "paye":
        return "bg-green-100 text-green-800"
      case "en_attente":
        return "bg-yellow-100 text-yellow-800"
      case "rembourse":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "paye":
        return "Payé"
      case "en_attente":
        return "En attente"
      case "rembourse":
        return "Remboursé"
      default:
        return statut
    }
  }

  const getMethodeLabel = (methode: string) => {
    switch (methode) {
      case "carte":
        return "Carte bancaire"
      case "especes":
        return "Espèces"
      case "virement":
        return "Virement"
      default:
        return methode
    }
  }

  const getStatistiques = () => {
    const totalEncaisse = filteredPaiements.filter((p) => p.statut === "paye").reduce((sum, p) => sum + p.montant, 0)
    const totalEnAttente = filteredPaiements
      .filter((p) => p.statut === "en_attente")
      .reduce((sum, p) => sum + p.montant, 0)
    const totalRembourse = filteredPaiements
      .filter((p) => p.statut === "rembourse")
      .reduce((sum, p) => sum + p.montant, 0)

    return {
      total: filteredPaiements.length,
      totalEncaisse,
      totalEnAttente,
      totalRembourse,
      payes: filteredPaiements.filter((p) => p.statut === "paye").length,
      enAttente: filteredPaiements.filter((p) => p.statut === "en_attente").length,
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des paiements</h1>
            <p className="text-lg text-gray-600">Suivez tous les paiements et transactions</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total encaissé</p>
                    <p className="text-xl font-bold">{stats.totalEncaisse.toLocaleString()}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Paiements</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-xl font-bold">{stats.totalEnAttente.toLocaleString()}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Taux de paiement</p>
                    <p className="text-xl font-bold">
                      {stats.total > 0 ? Math.round((stats.payes / stats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                      <SelectItem value="paye">Payé</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="rembourse">Remboursé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Méthode</label>
                  <Select
                    value={filters.methode}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, methode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les méthodes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les méthodes</SelectItem>
                      <SelectItem value="carte">Carte bancaire</SelectItem>
                      <SelectItem value="especes">Espèces</SelectItem>
                      <SelectItem value="virement">Virement</SelectItem>
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
                    onClick={() => setFilters({ recherche: "", statut: "all", methode: "all", periode: "all" })}
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des paiements */}
          {filteredPaiements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun paiement trouvé</h3>
                <p className="text-gray-600">
                  {paiements.length === 0
                    ? "Aucun paiement n'a encore été enregistré."
                    : "Aucun paiement ne correspond à vos critères de recherche."}
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
                          Paiement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Véhicule
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Méthode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPaiements.map((paiement) => (
                        <tr key={paiement.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{paiement.id}</div>
                            <div className="text-sm text-gray-500">Réservation #{paiement.reservationId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {paiement.client ? `${paiement.client.prenom} ${paiement.client.nom}` : "Client inconnu"}
                            </div>
                            <div className="text-sm text-gray-500">{paiement.client?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {paiement.vehicule
                                ? `${paiement.vehicule.marque} ${paiement.vehicule.modele}`
                                : "Véhicule inconnu"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{paiement.montant}€</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{getMethodeLabel(paiement.methodePaiement)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`px-2 py-1 text-xs ${getStatusColor(paiement.statut)}`}>
                              {getStatusLabel(paiement.statut)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(paiement.datePaiement).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
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

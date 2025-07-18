"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, CreditCard, Calendar, FileText } from "lucide-react"
import { getCurrentUser, getClientById, getReservationsByClientId, getPaiements, getVehicules } from "@/mocks/mock"
import type { User, Client, Reservation, Paiement, Vehicule } from "@/types"

export default function MesFactures() {
  const [user, setUser] = useState<User | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [filteredFactures, setFilteredFactures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    statut: "all",
    recherche: "",
    annee: "all",
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
        const [clientData, reservationsData, paiementsData, vehiculesData] = await Promise.all([
          getClientById(currentUser.clientId),
          getReservationsByClientId(currentUser.clientId),
          getPaiements(),
          getVehicules(),
        ])

        setClient(clientData)
        setReservations(reservationsData)
        setPaiements(paiementsData)
        setVehicules(vehiculesData)

        // Créer les factures en combinant réservations et paiements
        const factures = reservationsData.map((reservation) => {
          const paiement = paiementsData.find((p) => p.reservationId === reservation.id)
          const vehicule = vehiculesData.find((v) => v.id === reservation.vehiculeId)
          return {
            id: reservation.id,
            numero: `FAC-${reservation.id.toString().padStart(4, "0")}`,
            date: reservation.dateReservation,
            montant: reservation.prixTotal,
            statut: paiement?.statut || "en_attente",
            reservation,
            paiement,
            vehicule,
          }
        })

        setFilteredFactures(factures)
      }
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    const factures = reservations.map((reservation) => {
      const paiement = paiements.find((p) => p.reservationId === reservation.id)
      const vehicule = vehicules.find((v) => v.id === reservation.vehiculeId)
      return {
        id: reservation.id,
        numero: `FAC-${reservation.id.toString().padStart(4, "0")}`,
        date: reservation.dateReservation,
        montant: reservation.prixTotal,
        statut: paiement?.statut || "en_attente",
        reservation,
        paiement,
        vehicule,
      }
    })

    const filtered = factures.filter((facture) => {
      const matchStatut = filters.statut === "all" || facture.statut === filters.statut
      const matchRecherche =
        !filters.recherche ||
        facture.numero.toLowerCase().includes(filters.recherche.toLowerCase()) ||
        (facture.vehicule &&
          `${facture.vehicule.marque} ${facture.vehicule.modele}`
            .toLowerCase()
            .includes(filters.recherche.toLowerCase()))
      const matchAnnee = filters.annee === "all" || new Date(facture.date).getFullYear().toString() === filters.annee

      return matchStatut && matchRecherche && matchAnnee
    })

    setFilteredFactures(filtered)
  }, [filters, reservations, paiements, vehicules])

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
        return "Payée"
      case "en_attente":
        return "En attente"
      case "rembourse":
        return "Remboursée"
      default:
        return statut
    }
  }

  const handleDownloadPDF = (factureId: number) => {
    // Simulation du téléchargement PDF
    console.log(`Téléchargement de la facture ${factureId}`)
    // Ici on pourrait implémenter jsPDF pour générer un vrai PDF
  }

  const getTotalFactures = () => {
    return filteredFactures.reduce((sum, f) => sum + f.montant, 0)
  }

  const getAnneesDisponibles = () => {
    const annees = [...new Set(reservations.map((r) => new Date(r.dateReservation).getFullYear()))]
    return annees.sort((a, b) => b - a)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes factures</h1>
          <p className="text-lg text-gray-600">Consultez et téléchargez vos factures</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Total factures</p>
                  <p className="text-xl font-bold">{filteredFactures.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Payées</p>
                  <p className="text-xl font-bold">{filteredFactures.filter((f) => f.statut === "paye").length}</p>
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
                  <p className="text-xl font-bold">
                    {filteredFactures.filter((f) => f.statut === "en_attente").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Montant total</p>
                  <p className="text-xl font-bold">{getTotalFactures()}€</p>
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
                    placeholder="Numéro, véhicule..."
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
                    <SelectItem value="paye">Payées</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="rembourse">Remboursées</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Année</label>
                <Select
                  value={filters.annee}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, annee: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les années" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {getAnneesDisponibles().map((annee) => (
                      <SelectItem key={annee} value={annee.toString()}>
                        {annee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ statut: "all", recherche: "", annee: "all" })}
                  className="w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des factures */}
        {filteredFactures.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune facture trouvée</h3>
              <p className="text-gray-600">
                {reservations.length === 0
                  ? "Vous n'avez pas encore de factures."
                  : "Aucune facture ne correspond à vos critères de recherche."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFactures.map((facture) => (
              <Card key={facture.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">{facture.numero}</h3>
                          <Badge className={`px-2 py-1 text-xs ${getStatusColor(facture.statut)}`}>
                            {getStatusLabel(facture.statut)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">
                          {facture.vehicule
                            ? `${facture.vehicule.marque} ${facture.vehicule.modele}`
                            : "Véhicule inconnu"}
                        </p>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(facture.date).toLocaleDateString()}
                          </div>
                          <div className="font-semibold text-blue-600">{facture.montant}€</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(facture.id)}
                        className="bg-transparent"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" asChild className="bg-transparent">
                        <a href={`/client/reservation/${facture.id}`}>Détails</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

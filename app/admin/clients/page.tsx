"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Star, Calendar, Phone, Mail, MapPin } from "lucide-react"
import { getCurrentUser, getClients } from "@/mocks/mock"
import type { User, Client } from "@/types"
import Sidebar from "@/components/sidebar"

export default function GestionClients() {
  const [user, setUser] = useState<User | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    recherche: "",
    statut: "all",
    fidelite: "all",
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

      const clientsData = await getClients()
      setClients(clientsData)
      setFilteredClients(clientsData)
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    const filtered = clients.filter((client) => {
      const matchRecherche =
        !filters.recherche ||
        client.nom.toLowerCase().includes(filters.recherche.toLowerCase()) ||
        client.prenom.toLowerCase().includes(filters.recherche.toLowerCase()) ||
        client.email.toLowerCase().includes(filters.recherche.toLowerCase())

      const matchFidelite =
        filters.fidelite === "all" ||
        (filters.fidelite === "vip" && client.pointsFidelite >= 500) ||
        (filters.fidelite === "gold" && client.pointsFidelite >= 200 && client.pointsFidelite < 500) ||
        (filters.fidelite === "silver" && client.pointsFidelite >= 100 && client.pointsFidelite < 200) ||
        (filters.fidelite === "standard" && client.pointsFidelite < 100)

      return matchRecherche && matchFidelite
    })

    setFilteredClients(filtered)
  }, [filters, clients])

  const getStatutFidelite = (points: number) => {
    if (points >= 500) return { label: "VIP", color: "bg-purple-100 text-purple-800" }
    if (points >= 200) return { label: "Gold", color: "bg-yellow-100 text-yellow-800" }
    if (points >= 100) return { label: "Silver", color: "bg-gray-100 text-gray-800" }
    return { label: "Standard", color: "bg-blue-100 text-blue-800" }
  }

  const getStatistiques = () => {
    return {
      total: clients.length,
      vip: clients.filter((c) => c.pointsFidelite >= 500).length,
      gold: clients.filter((c) => c.pointsFidelite >= 200 && c.pointsFidelite < 500).length,
      nouveaux: clients.filter((c) => {
        const inscription = new Date(c.dateInscription)
        const maintenant = new Date()
        const diffMois = (maintenant.getTime() - inscription.getTime()) / (1000 * 60 * 60 * 24 * 30)
        return diffMois <= 1
      }).length,
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des clients</h1>
            <p className="text-lg text-gray-600">Gérez votre base de clients</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total clients</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="h-6 w-6 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Clients VIP</p>
                    <p className="text-xl font-bold">{stats.vip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Clients Gold</p>
                    <p className="text-xl font-bold">{stats.gold}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Nouveaux (30j)</p>
                    <p className="text-xl font-bold">{stats.nouveaux}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      placeholder="Nom, prénom, email..."
                      value={filters.recherche}
                      onChange={(e) => setFilters((prev) => ({ ...prev, recherche: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Statut fidélité</label>
                  <Select
                    value={filters.fidelite}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, fidelite: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="vip">VIP (500+ points)</SelectItem>
                      <SelectItem value="gold">Gold (200-499 points)</SelectItem>
                      <SelectItem value="silver">Silver (100-199 points)</SelectItem>
                      <SelectItem value="standard">Standard (&lt;100 points)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ recherche: "", statut: "all", fidelite: "all" })}
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des clients */}
          {filteredClients.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun client trouvé</h3>
                <p className="text-gray-600">
                  {clients.length === 0
                    ? "Aucun client n'est encore inscrit."
                    : "Aucun client ne correspond à vos critères de recherche."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => {
                const statutFidelite = getStatutFidelite(client.pointsFidelite)
                return (
                  <Card key={client.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {client.prenom} {client.nom}
                          </h3>
                          <p className="text-gray-600 text-sm">Client #{client.id}</p>
                        </div>
                        <Badge className={`px-2 py-1 text-xs ${statutFidelite.color}`}>{statutFidelite.label}</Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{client.telephone}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate">{client.adresse}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Inscrit le {new Date(client.dateInscription).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{client.pointsFidelite}</p>
                          <p className="text-xs text-gray-600">Points fidélité</p>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            Voir détails
                          </Button>
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
    </div>
  )
}

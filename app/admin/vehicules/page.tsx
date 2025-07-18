"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Car } from "lucide-react"
import { getCurrentUser, getVehicules, deleteVehicule } from "@/mocks/mock"
import type { User, Vehicule } from "@/types"
import Sidebar from "@/components/sidebar"

export default function GestionVehicules() {
  const [user, setUser] = useState<User | null>(null)
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [filteredVehicules, setFilteredVehicules] = useState<Vehicule[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    recherche: "",
    categorie: "all",
    disponible: "all",
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

      const vehiculesData = await getVehicules()
      setVehicules(vehiculesData)
      setFilteredVehicules(vehiculesData)
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    const filtered = vehicules.filter((vehicule) => {
      const matchRecherche =
        !filters.recherche ||
        vehicule.marque.toLowerCase().includes(filters.recherche.toLowerCase()) ||
        vehicule.modele.toLowerCase().includes(filters.recherche.toLowerCase())

      const matchCategorie = filters.categorie === "all" || vehicule.categorie === filters.categorie
      const matchDisponible =
        filters.disponible === "all" || (filters.disponible === "true" ? vehicule.disponible : !vehicule.disponible)

      return matchRecherche && matchCategorie && matchDisponible
    })

    setFilteredVehicules(filtered)
  }, [filters, vehicules])

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      const success = await deleteVehicule(id)
      if (success) {
        setVehicules((prev) => prev.filter((v) => v.id !== id))
      }
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des véhicules</h1>
                <p className="text-lg text-gray-600">Gérez votre flotte de véhicules</p>
              </div>
              <Link href="/admin/vehicules/nouveau">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un véhicule
                </Button>
              </Link>
            </div>
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
                      placeholder="Marque, modèle..."
                      value={filters.recherche}
                      onChange={(e) => setFilters((prev) => ({ ...prev, recherche: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie</label>
                  <Select
                    value={filters.categorie}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, categorie: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="economique">Économique</SelectItem>
                      <SelectItem value="compacte">Compacte</SelectItem>
                      <SelectItem value="berline">Berline</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="luxe">Luxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Disponibilité</label>
                  <Select
                    value={filters.disponible}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, disponible: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="true">Disponibles</SelectItem>
                      <SelectItem value="false">Non disponibles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ recherche: "", categorie: "all", disponible: "all" })}
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Car className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold">{vehicules.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Car className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Disponibles</p>
                    <p className="text-xl font-bold">{vehicules.filter((v) => v.disponible).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Car className="h-6 w-6 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">En location</p>
                    <p className="text-xl font-bold">{vehicules.filter((v) => !v.disponible).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Car className="h-6 w-6 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Taux d'occupation</p>
                    <p className="text-xl font-bold">
                      {vehicules.length > 0
                        ? Math.round(
                            ((vehicules.length - vehicules.filter((v) => v.disponible).length) / vehicules.length) *
                              100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des véhicules */}
          {filteredVehicules.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun véhicule trouvé</h3>
                <p className="text-gray-600 mb-6">
                  {vehicules.length === 0
                    ? "Aucun véhicule n'a été ajouté à votre flotte."
                    : "Aucun véhicule ne correspond à vos critères de recherche."}
                </p>
                <Link href="/admin/vehicules/nouveau">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un véhicule
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicules.map((vehicule) => (
                <Card key={vehicule.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {vehicule.marque} {vehicule.modele}
                        </h3>
                        <p className="text-gray-600 capitalize">{vehicule.categorie}</p>
                      </div>
                      <Badge variant={vehicule.disponible ? "default" : "destructive"}>
                        {vehicule.disponible ? "Disponible" : "En location"}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Prix/jour:</span>
                        <span className="font-semibold">{vehicule.prixJournalier}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carburant:</span>
                        <span className="capitalize">{vehicule.carburant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transmission:</span>
                        <span className="capitalize">{vehicule.transmission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Places:</span>
                        <span>{vehicule.places}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kilométrage:</span>
                        <span>{vehicule.kilometrage.toLocaleString()} km</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/admin/vehicules/${vehicule.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(vehicule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

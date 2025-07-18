"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Fuel, Users, Settings, Star } from "lucide-react"
import { getVehicules, getAvis } from "@/mocks/mock"
import type { Vehicule, Avis } from "@/types"

export default function Catalogue() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [avis, setAvis] = useState<Avis[]>([])
  const [filteredVehicules, setFilteredVehicules] = useState<Vehicule[]>([])
  const [filters, setFilters] = useState({
    categorie: "all",
    carburant: "all",
    transmission: "all",
    prixMax: "",
    recherche: "",
  })

  useEffect(() => {
    const loadData = async () => {
      const [vehiculesData, avisData] = await Promise.all([getVehicules(), getAvis()])
      setVehicules(vehiculesData)
      setAvis(avisData)
      setFilteredVehicules(vehiculesData)
    }
    loadData()
  }, [])

  useEffect(() => {
    const filtered = vehicules.filter((vehicule) => {
      const matchCategorie = filters.categorie === "all" || vehicule.categorie === filters.categorie
      const matchCarburant = filters.carburant === "all" || vehicule.carburant === filters.carburant
      const matchTransmission = filters.transmission === "all" || vehicule.transmission === filters.transmission
      const matchPrix = !filters.prixMax || vehicule.prixJournalier <= Number.parseInt(filters.prixMax)
      const matchRecherche =
        !filters.recherche ||
        vehicule.marque.toLowerCase().includes(filters.recherche.toLowerCase()) ||
        vehicule.modele.toLowerCase().includes(filters.recherche.toLowerCase())

      return matchCategorie && matchCarburant && matchTransmission && matchPrix && matchRecherche
    })

    setFilteredVehicules(filtered)
  }, [filters, vehicules])

  const getVehiculeRating = (vehiculeId: number) => {
    const vehiculeAvis = avis.filter((a) => a.vehiculeId === vehiculeId)
    if (vehiculeAvis.length === 0) return 0
    const moyenne = vehiculeAvis.reduce((sum, a) => sum + a.note, 0) / vehiculeAvis.length
    return Math.round(moyenne * 10) / 10
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Catalogue des véhicules</h1>
          <p className="text-lg text-gray-600">Trouvez le véhicule parfait pour votre voyage</p>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recherche</label>
              <Input
                placeholder="Marque, modèle..."
                value={filters.recherche}
                onChange={(e) => handleFilterChange("recherche", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Catégorie</label>
              <Select value={filters.categorie} onValueChange={(value) => handleFilterChange("categorie", value)}>
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
              <label className="block text-sm font-medium mb-2">Carburant</label>
              <Select value={filters.carburant} onValueChange={(value) => handleFilterChange("carburant", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="essence">Essence</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electrique">Électrique</SelectItem>
                  <SelectItem value="hybride">Hybride</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Transmission</label>
              <Select value={filters.transmission} onValueChange={(value) => handleFilterChange("transmission", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="manuelle">Manuelle</SelectItem>
                  <SelectItem value="automatique">Automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prix max/jour</label>
              <Input
                type="number"
                placeholder="€"
                value={filters.prixMax}
                onChange={(e) => handleFilterChange("prixMax", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredVehicules.length} véhicule{filteredVehicules.length > 1 ? "s" : ""} trouvé
            {filteredVehicules.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicules.map((vehicule) => {
            const rating = getVehiculeRating(vehicule.id)
            return (
              <Card key={vehicule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative">
                    <Image
                      src={vehicule.image || "/placeholder.svg"}
                      alt={`${vehicule.marque} ${vehicule.modele}`}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {!vehicule.disponible && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                        <Badge variant="destructive">Non disponible</Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">
                      {vehicule.marque} {vehicule.modele}
                    </CardTitle>
                    {rating > 0 && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{rating}</span>
                      </div>
                    )}
                  </div>

                  <CardDescription className="mb-3">{vehicule.description}</CardDescription>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {vehicule.places}
                    </div>
                    <div className="flex items-center">
                      <Fuel className="h-4 w-4 mr-1" />
                      {vehicule.carburant}
                    </div>
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-1" />
                      {vehicule.transmission}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">{vehicule.prixJournalier}€</span>
                      <span className="text-gray-600">/jour</span>
                    </div>
                    <div className="space-x-2">
                      <Link href={`/vehicule/${vehicule.id}`}>
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                      </Link>
                      {vehicule.disponible && (
                        <Link href={`/reservation/${vehicule.id}`}>
                          <Button size="sm">Réserver</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredVehicules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun véhicule ne correspond à vos critères.</p>
            <Button
              onClick={() =>
                setFilters({ categorie: "all", carburant: "all", transmission: "all", prixMax: "", recherche: "" })
              }
              className="mt-4"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

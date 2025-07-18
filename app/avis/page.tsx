"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MessageSquare } from "lucide-react"
import { getAvis, getVehicules, getClients } from "@/mocks/mock"
import type { Avis, Vehicule, Client } from "@/types"

export default function AvisList() {
  const [avis, setAvis] = useState<Avis[]>([])
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filteredAvis, setFilteredAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    note: "all",
    vehicule: "all",
  })

  useEffect(() => {
    const loadData = async () => {
      const [avisData, vehiculesData, clientsData] = await Promise.all([getAvis(), getVehicules(), getClients()])

      setAvis(avisData)
      setVehicules(vehiculesData)
      setClients(clientsData)
      setFilteredAvis(avisData)
      setLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    const filtered = avis.filter((avisItem) => {
      const matchNote = filters.note === "all" || avisItem.note.toString() === filters.note
      const matchVehicule = filters.vehicule === "all" || avisItem.vehiculeId.toString() === filters.vehicule

      return matchNote && matchVehicule
    })

    setFilteredAvis(filtered)
  }, [filters, avis])

  const getVehiculeById = (id: number) => vehicules.find((v) => v.id === id)
  const getClientById = (id: number) => clients.find((c) => c.id === id)

  const renderStars = (note: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < note ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const getNoteMoyenne = () => {
    if (filteredAvis.length === 0) return 0
    const total = filteredAvis.reduce((sum, a) => sum + a.note, 0)
    return Math.round((total / filteredAvis.length) * 10) / 10
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Avis clients</h1>
          <p className="text-lg text-gray-600">Découvrez les retours de nos clients sur nos véhicules</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total des avis</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredAvis.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-900 mr-2">{getNoteMoyenne()}</p>
                    <div className="flex">{renderStars(Math.round(getNoteMoyenne()))}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avis 5 étoiles</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredAvis.filter((a) => a.note === 5).length}</p>
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
                <label className="block text-sm font-medium mb-2">Note</label>
                <Select
                  value={filters.note}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, note: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les notes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les notes</SelectItem>
                    <SelectItem value="5">5 étoiles</SelectItem>
                    <SelectItem value="4">4 étoiles</SelectItem>
                    <SelectItem value="3">3 étoiles</SelectItem>
                    <SelectItem value="2">2 étoiles</SelectItem>
                    <SelectItem value="1">1 étoile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Véhicule</label>
                <Select
                  value={filters.vehicule}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, vehicule: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les véhicules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les véhicules</SelectItem>
                    {vehicules.map((vehicule) => (
                      <SelectItem key={vehicule.id} value={vehicule.id.toString()}>
                        {vehicule.marque} {vehicule.modele}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ note: "all", vehicule: "all" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des avis */}
        {filteredAvis.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun avis trouvé</h3>
              <p className="text-gray-600">
                {avis.length === 0
                  ? "Aucun avis n'a encore été laissé par nos clients."
                  : "Aucun avis ne correspond à vos critères de recherche."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredAvis.map((avisItem) => {
              const vehicule = getVehiculeById(avisItem.vehiculeId)
              const client = getClientById(avisItem.clientId)

              return (
                <Card key={avisItem.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {vehicule ? `${vehicule.marque} ${vehicule.modele}` : "Véhicule inconnu"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Par {client ? `${client.prenom} ${client.nom.charAt(0)}.` : "Client anonyme"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          {renderStars(avisItem.note)}
                          <span className="ml-2 text-sm font-medium">{avisItem.note}/5</span>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(avisItem.dateAvis).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">{avisItem.commentaire}</p>

                    {vehicule && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <Badge variant="outline" className="capitalize">
                            {vehicule.categorie}
                          </Badge>
                          <span>{vehicule.carburant}</span>
                          <span>{vehicule.transmission}</span>
                          <span>{vehicule.places} places</span>
                        </div>
                      </div>
                    )}
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

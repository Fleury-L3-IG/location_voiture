"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Building, Phone, Mail, Clock, MapPin } from "lucide-react"
import { getCurrentUser, getAgences, deleteAgence } from "@/mocks/mock"
import type { User, Agence } from "@/types"
import Sidebar from "@/components/sidebar"

export default function GestionAgences() {
  const [user, setUser] = useState<User | null>(null)
  const [agences, setAgences] = useState<Agence[]>([])
  const [filteredAgences, setFilteredAgences] = useState<Agence[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    recherche: "",
  })
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      const agencesData = await getAgences()
      setAgences(agencesData)
      setFilteredAgences(agencesData)
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    const filtered = agences.filter((agence) => {
      const matchRecherche =
        !filters.recherche ||
        agence.nom.toLowerCase().includes(filters.recherche.toLowerCase()) ||
        agence.adresse.toLowerCase().includes(filters.recherche.toLowerCase()) ||
        agence.email.toLowerCase().includes(filters.recherche.toLowerCase())

      return matchRecherche
    })

    setFilteredAgences(filtered)
  }, [filters, agences])

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette agence ?")) {
      const success = await deleteAgence(id)
      if (success) {
        setAgences((prev) => prev.filter((a) => a.id !== id))
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des agences</h1>
                <p className="text-lg text-gray-600">Gérez votre réseau d'agences</p>
              </div>
              <Link href="/admin/agences/nouvelle">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une agence
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Building className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total agences</p>
                    <p className="text-xl font-bold">{agences.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Building className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Actives</p>
                    <p className="text-xl font-bold">{agences.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Villes</p>
                    <p className="text-xl font-bold">
                      {new Set(agences.map((a) => a.adresse.split(",").pop()?.trim())).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Ouvertes</p>
                    <p className="text-xl font-bold">{agences.length}</p>
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
                      placeholder="Nom, adresse, email..."
                      value={filters.recherche}
                      onChange={(e) => setFilters((prev) => ({ ...prev, recherche: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={() => setFilters({ recherche: "" })} className="w-full">
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des agences */}
          {filteredAgences.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune agence trouvée</h3>
                <p className="text-gray-600 mb-6">
                  {agences.length === 0
                    ? "Aucune agence n'a encore été créée."
                    : "Aucune agence ne correspond à vos critères de recherche."}
                </p>
                <Link href="/admin/agences/nouvelle">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une agence
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgences.map((agence) => (
                <Card key={agence.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{agence.nom}</h3>
                        <p className="text-gray-600 text-sm">Agence #{agence.id}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{agence.adresse}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{agence.telephone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="truncate">{agence.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{agence.heuresOuverture}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4 border-t">
                      <Link href={`/admin/agences/${agence.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(agence.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={agences.length === 1}
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

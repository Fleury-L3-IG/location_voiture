"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, UserCheck, Mail, Calendar, Building } from "lucide-react"
import { getCurrentUser, getEmployes, deleteEmploye } from "@/mocks/mock"
import type { User, Employe } from "@/types"
import Sidebar from "@/components/sidebar"

export default function GestionEmployes() {
  const [user, setUser] = useState<User | null>(null)
  const [employes, setEmployes] = useState<Employe[]>([])
  const [filteredEmployes, setFilteredEmployes] = useState<Employe[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    recherche: "",
    role: "all",
    agence: "all",
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

      const employesData = await getEmployes()
      setEmployes(employesData)
      setFilteredEmployes(employesData)
      setLoading(false)
    }

    loadData()
  }, [router])

  useEffect(() => {
    const filtered = employes.filter((employe) => {
      const matchRecherche =
        !filters.recherche ||
        employe.nom.toLowerCase().includes(filters.recherche.toLowerCase()) ||
        employe.prenom.toLowerCase().includes(filters.recherche.toLowerCase()) ||
        employe.email.toLowerCase().includes(filters.recherche.toLowerCase())

      const matchRole = filters.role === "all" || employe.role === filters.role
      const matchAgence = filters.agence === "all" || employe.agenceId.toString() === filters.agence

      return matchRecherche && matchRole && matchAgence
    })

    setFilteredEmployes(filtered)
  }, [filters, employes])

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      const success = await deleteEmploye(id)
      if (success) {
        setEmployes((prev) => prev.filter((e) => e.id !== id))
      }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "employe":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur"
      case "employe":
        return "Employé"
      default:
        return role
    }
  }

  const getStatistiques = () => {
    return {
      total: employes.length,
      admins: employes.filter((e) => e.role === "admin").length,
      employes: employes.filter((e) => e.role === "employe").length,
      nouveaux: employes.filter((e) => {
        const embauche = new Date(e.dateEmbauche)
        const maintenant = new Date()
        const diffMois = (maintenant.getTime() - embauche.getTime()) / (1000 * 60 * 60 * 24 * 30)
        return diffMois <= 3
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des employés</h1>
                <p className="text-lg text-gray-600">Gérez votre équipe</p>
              </div>
              <Link href="/admin/employes/nouveau">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un employé
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total employés</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <UserCheck className="h-6 w-6 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Administrateurs</p>
                    <p className="text-xl font-bold">{stats.admins}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Employés</p>
                    <p className="text-xl font-bold">{stats.employes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Nouveaux (3 mois)</p>
                    <p className="text-xl font-bold">{stats.nouveaux}</p>
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
                      placeholder="Nom, prénom, email..."
                      value={filters.recherche}
                      onChange={(e) => setFilters((prev) => ({ ...prev, recherche: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rôle</label>
                  <Select
                    value={filters.role}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les rôles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="employe">Employé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Agence</label>
                  <Select
                    value={filters.agence}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, agence: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les agences" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les agences</SelectItem>
                      <SelectItem value="1">Agence Centrale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ recherche: "", role: "all", agence: "all" })}
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des employés */}
          {filteredEmployes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun employé trouvé</h3>
                <p className="text-gray-600 mb-6">
                  {employes.length === 0
                    ? "Aucun employé n'a encore été ajouté."
                    : "Aucun employé ne correspond à vos critères de recherche."}
                </p>
                <Link href="/admin/employes/nouveau">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un employé
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployes.map((employe) => (
                <Card key={employe.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {employe.prenom} {employe.nom}
                        </h3>
                        <p className="text-gray-600 text-sm">Employé #{employe.id}</p>
                      </div>
                      <Badge className={`px-2 py-1 text-xs ${getRoleColor(employe.role)}`}>
                        {getRoleLabel(employe.role)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="truncate">{employe.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        <span>Agence #{employe.agenceId}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Embauché le {new Date(employe.dateEmbauche).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4 border-t">
                      <Link href={`/admin/employes/${employe.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(employe.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={employe.role === "admin" && stats.admins === 1}
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

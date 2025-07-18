"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Download, Calendar, Users, DollarSign, Star, FileText, PieChart } from "lucide-react"
import { getCurrentUser, getVehicules, getClients, getReservations, getPaiements, getAvis } from "@/mocks/mock"
import type { User, Vehicule, Client, Reservation, Paiement, Avis } from "@/types"
import Sidebar from "@/components/sidebar"

export default function Rapports() {
  const [user, setUser] = useState<User | null>(null)
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState("30j")
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "employe")) {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      const [vehiculesData, clientsData, reservationsData, paiementsData, avisData] = await Promise.all([
        getVehicules(),
        getClients(),
        getReservations(),
        getPaiements(),
        getAvis(),
      ])

      setVehicules(vehiculesData)
      setClients(clientsData)
      setReservations(reservationsData)
      setPaiements(paiementsData)
      setAvis(avisData)
      setLoading(false)
    }

    loadData()
  }, [router])

  const getDateFilter = () => {
    const maintenant = new Date()
    let dateDebut = new Date()

    switch (periode) {
      case "7j":
        dateDebut.setDate(maintenant.getDate() - 7)
        break
      case "30j":
        dateDebut.setDate(maintenant.getDate() - 30)
        break
      case "90j":
        dateDebut.setDate(maintenant.getDate() - 90)
        break
      case "1an":
        dateDebut.setFullYear(maintenant.getFullYear() - 1)
        break
      default:
        dateDebut = new Date(0) // Toutes les données
    }

    return dateDebut
  }

  const getStatistiquesGenerales = () => {
    const dateDebut = getDateFilter()

    const reservationsPeriode = reservations.filter((r) => new Date(r.dateReservation) >= dateDebut)
    const paiementsPeriode = paiements.filter((p) => new Date(p.datePaiement) >= dateDebut)
    const clientsPeriode = clients.filter((c) => new Date(c.dateInscription) >= dateDebut)

    const chiffreAffaires = paiementsPeriode.filter((p) => p.statut === "paye").reduce((sum, p) => sum + p.montant, 0)
    const tauxOccupation =
      vehicules.length > 0
        ? Math.round(((vehicules.length - vehicules.filter((v) => v.disponible).length) / vehicules.length) * 100)
        : 0

    return {
      reservations: reservationsPeriode.length,
      chiffreAffaires,
      nouveauxClients: clientsPeriode.length,
      tauxOccupation,
      noteMoyenne: avis.length > 0 ? Math.round((avis.reduce((sum, a) => sum + a.note, 0) / avis.length) * 10) / 10 : 0,
    }
  }

  const getTopVehicules = () => {
    const reservationsParVehicule = reservations.reduce(
      (acc, r) => {
        acc[r.vehiculeId] = (acc[r.vehiculeId] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    return Object.entries(reservationsParVehicule)
      .map(([vehiculeId, count]) => {
        const vehicule = vehicules.find((v) => v.id === Number.parseInt(vehiculeId))
        return {
          vehicule,
          reservations: count,
          revenus: reservations
            .filter((r) => r.vehiculeId === Number.parseInt(vehiculeId))
            .reduce((sum, r) => sum + r.prixTotal, 0),
        }
      })
      .filter((item) => item.vehicule)
      .sort((a, b) => b.reservations - a.reservations)
      .slice(0, 5)
  }

  const getStatistiquesParCategorie = () => {
    const categories = vehicules.reduce(
      (acc, v) => {
        if (!acc[v.categorie]) {
          acc[v.categorie] = { count: 0, reservations: 0, revenus: 0 }
        }
        acc[v.categorie].count++
        return acc
      },
      {} as Record<string, { count: number; reservations: number; revenus: number }>,
    )

    reservations.forEach((r) => {
      const vehicule = vehicules.find((v) => v.id === r.vehiculeId)
      if (vehicule && categories[vehicule.categorie]) {
        categories[vehicule.categorie].reservations++
        categories[vehicule.categorie].revenus += r.prixTotal
      }
    })

    return Object.entries(categories).map(([categorie, stats]) => ({
      categorie,
      ...stats,
    }))
  }

  const handleExportPDF = () => {
    // Simulation de l'export PDF
    console.log("Export PDF des rapports")
    alert("Fonctionnalité d'export PDF à implémenter avec jsPDF")
  }

  const handleExportExcel = () => {
    // Simulation de l'export Excel
    console.log("Export Excel des rapports")
    alert("Fonctionnalité d'export Excel à implémenter")
  }

  const stats = getStatistiquesGenerales()
  const topVehicules = getTopVehicules()
  const statsCategories = getStatistiquesParCategorie()

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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports et statistiques</h1>
                <p className="text-lg text-gray-600">Analysez les performances de votre agence</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={handleExportExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </div>

          {/* Sélecteur de période */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Période d'analyse :</label>
                <Select value={periode} onValueChange={setPeriode}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7j">7 derniers jours</SelectItem>
                    <SelectItem value="30j">30 derniers jours</SelectItem>
                    <SelectItem value="90j">90 derniers jours</SelectItem>
                    <SelectItem value="1an">1 an</SelectItem>
                    <SelectItem value="all">Toute la période</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Réservations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.reservations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.chiffreAffaires.toLocaleString()}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Nouveaux clients</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.nouveauxClients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taux d'occupation</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.tauxOccupation}%</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.noteMoyenne}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top véhicules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Top 5 des véhicules
                </CardTitle>
                <CardDescription>Véhicules les plus réservés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topVehicules.map((item, index) => (
                    <div key={item.vehicule?.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {item.vehicule?.marque} {item.vehicule?.modele}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">{item.vehicule?.categorie}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.reservations} réservations</p>
                        <p className="text-sm text-gray-600">{item.revenus}€</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Statistiques par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Répartition par catégorie
                </CardTitle>
                <CardDescription>Performance par type de véhicule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statsCategories.map((cat) => (
                    <div key={cat.categorie} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{cat.categorie}</span>
                        <span className="text-sm text-gray-600">{cat.count} véhicules</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{cat.reservations} réservations</span>
                        <span className="font-semibold">{cat.revenus}€</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.max(
                              (cat.reservations / Math.max(...statsCategories.map((s) => s.reservations))) * 100,
                              5,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Évolution mensuelle */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Évolution des performances
              </CardTitle>
              <CardDescription>Tendances sur la période sélectionnée</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">+{Math.round(Math.random() * 20 + 5)}%</div>
                  <p className="text-sm text-gray-600">Croissance des réservations</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">+{Math.round(Math.random() * 15 + 8)}%</div>
                  <p className="text-sm text-gray-600">Augmentation du CA</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">+{Math.round(Math.random() * 25 + 10)}%</div>
                  <p className="text-sm text-gray-600">Nouveaux clients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Recommandations
              </CardTitle>
              <CardDescription>Suggestions d'amélioration basées sur les données</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.tauxOccupation > 80 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Taux d'occupation élevé</h4>
                    <p className="text-sm text-yellow-700">
                      Votre taux d'occupation est de {stats.tauxOccupation}%. Considérez l'ajout de nouveaux véhicules
                      pour répondre à la demande.
                    </p>
                  </div>
                )}

                {stats.noteMoyenne < 4 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Note moyenne faible</h4>
                    <p className="text-sm text-red-700">
                      La note moyenne de {stats.noteMoyenne}/5 peut être améliorée. Analysez les avis clients pour
                      identifier les points d'amélioration.
                    </p>
                  </div>
                )}

                {topVehicules.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Véhicules populaires</h4>
                    <p className="text-sm text-green-700">
                      Le {topVehicules[0].vehicule?.marque} {topVehicules[0].vehicule?.modele} est très demandé.
                      Considérez l'ajout de véhicules similaires à votre flotte.
                    </p>
                  </div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Optimisation des prix</h4>
                  <p className="text-sm text-blue-700">
                    Analysez régulièrement vos tarifs par rapport à la concurrence et ajustez selon la demande
                    saisonnière.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

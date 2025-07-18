"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Fuel, Users, Settings, Calendar, Star, CheckCircle, ArrowLeft } from "lucide-react"
import { getVehiculeById, getAvis } from "@/mocks/mock"
import type { Vehicule, Avis } from "@/types"

export default function VehiculeDetails() {
  const params = useParams()
  const [vehicule, setVehicule] = useState<Vehicule | null>(null)
  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (params.id) {
        const vehiculeId = Number.parseInt(params.id as string)
        const [vehiculeData, avisData] = await Promise.all([getVehiculeById(vehiculeId), getAvis()])
        setVehicule(vehiculeData)
        setAvis(avisData.filter((a) => a.vehiculeId === vehiculeId))
        setLoading(false)
      }
    }
    loadData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!vehicule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Véhicule non trouvé</h1>
          <Link href="/catalogue">
            <Button>Retour au catalogue</Button>
          </Link>
        </div>
      </div>
    )
  }

  const rating = avis.length > 0 ? Math.round((avis.reduce((sum, a) => sum + a.note, 0) / avis.length) * 10) / 10 : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/catalogue" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au catalogue
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image du véhicule */}
          <div>
            <div className="relative">
              <Image
                src={vehicule.image || "/placeholder.svg"}
                alt={`${vehicule.marque} ${vehicule.modele}`}
                width={600}
                height={400}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              {!vehicule.disponible && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    Non disponible
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Informations du véhicule */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {vehicule.marque} {vehicule.modele}
                </h1>
                <p className="text-lg text-gray-600 capitalize">
                  {vehicule.categorie} • {vehicule.annee}
                </p>
              </div>
              {rating > 0 && (
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold">{rating}</span>
                  <span className="text-gray-600 ml-1">({avis.length} avis)</span>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-6">{vehicule.description}</p>

            {/* Caractéristiques */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span>{vehicule.places} places</span>
              </div>
              <div className="flex items-center">
                <Fuel className="h-5 w-5 text-gray-400 mr-2" />
                <span className="capitalize">{vehicule.carburant}</span>
              </div>
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-400 mr-2" />
                <span className="capitalize">{vehicule.transmission}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span>{vehicule.kilometrage.toLocaleString()} km</span>
              </div>
            </div>

            {/* Équipements */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Équipements inclus</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vehicule.equipements.map((equipement, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">{equipement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prix et réservation */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-3xl font-bold text-blue-600">{vehicule.prixJournalier}€</span>
                    <span className="text-gray-600 ml-2">/jour</span>
                  </div>
                  <Badge variant={vehicule.disponible ? "default" : "destructive"}>
                    {vehicule.disponible ? "Disponible" : "Non disponible"}
                  </Badge>
                </div>

                {vehicule.disponible && (
                  <Link href={`/reservation/${vehicule.id}`} className="w-full">
                    <Button className="w-full" size="lg">
                      Réserver maintenant
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Avis clients */}
        {avis.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Avis clients ({avis.length})</CardTitle>
              <CardDescription>Note moyenne: {rating}/5 étoiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {avis.map((avisItem, index) => (
                  <div key={avisItem.id}>
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < avisItem.note ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {new Date(avisItem.dateAvis).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{avisItem.commentaire}</p>
                    {index < avis.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

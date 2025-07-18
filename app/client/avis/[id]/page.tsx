"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, ArrowLeft, CheckCircle } from "lucide-react"
import { getCurrentUser, getReservationById, getVehiculeById, addAvis } from "@/mocks/mock"
import type { User, Reservation, Vehicule } from "@/types"

export default function LaisserAvis() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [vehicule, setVehicule] = useState<Vehicule | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    note: 0,
    commentaire: "",
  })

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "client") {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      if (params.id && currentUser.clientId) {
        const reservationId = Number.parseInt(params.id as string)
        const reservationData = await getReservationById(reservationId)

        if (reservationData && reservationData.clientId === currentUser.clientId) {
          if (reservationData.statut !== "terminee") {
            router.push("/client/reservations")
            return
          }

          setReservation(reservationData)
          const vehiculeData = await getVehiculeById(reservationData.vehiculeId)
          setVehicule(vehiculeData)
        } else {
          router.push("/client/reservations")
          return
        }
      }
      setLoading(false)
    }

    loadData()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reservation || !user?.clientId || formData.note === 0) {
      setError("Veuillez sélectionner une note")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      await addAvis({
        clientId: user.clientId,
        vehiculeId: reservation.vehiculeId,
        note: formData.note,
        commentaire: formData.commentaire,
      })

      setSubmitted(true)
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi de votre avis")
    } finally {
      setSubmitting(false)
    }
  }

  const handleStarClick = (note: number) => {
    setFormData((prev) => ({ ...prev, note }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!reservation || !vehicule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Réservation non trouvée</h1>
          <Link href="/client/reservations">
            <Button>Retour aux réservations</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Merci pour votre avis !</h1>
              <p className="text-lg text-gray-600 mb-6">
                Votre avis a été enregistré avec succès. Il sera visible sur la page du véhicule.
              </p>
              <div className="space-x-4">
                <Link href="/client/reservations">
                  <Button>Mes réservations</Button>
                </Link>
                <Link href="/avis">
                  <Button variant="outline">Voir tous les avis</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/client/reservations" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux réservations
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Laisser un avis</CardTitle>
            <CardDescription>
              Partagez votre expérience avec le {vehicule.marque} {vehicule.modele}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Informations de la réservation */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Détails de votre location</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Véhicule :</strong> {vehicule.marque} {vehicule.modele}
                </p>
                <p>
                  <strong>Période :</strong> {new Date(reservation.dateDebut).toLocaleDateString()} -{" "}
                  {new Date(reservation.dateFin).toLocaleDateString()}
                </p>
                <p>
                  <strong>Réservation :</strong> #{reservation.id}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Note avec étoiles */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Note générale <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          star <= formData.note ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-200"
                        }`}
                      />
                    </button>
                  ))}
                  {formData.note > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.note === 1
                        ? "Très insatisfait"
                        : formData.note === 2
                          ? "Insatisfait"
                          : formData.note === 3
                            ? "Correct"
                            : formData.note === 4
                              ? "Satisfait"
                              : "Très satisfait"}
                    </span>
                  )}
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Votre commentaire <span className="text-gray-500">(optionnel)</span>
                </label>
                <Textarea
                  value={formData.commentaire}
                  onChange={(e) => setFormData((prev) => ({ ...prev, commentaire: e.target.value }))}
                  placeholder="Partagez votre expérience avec ce véhicule : confort, consommation, équipements..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Votre avis aidera d'autres clients à faire leur choix</p>
              </div>

              {/* Boutons */}
              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={submitting || formData.note === 0} className="flex-1">
                  {submitting ? "Envoi en cours..." : "Publier mon avis"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

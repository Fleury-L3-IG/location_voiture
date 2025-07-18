"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, MapPin, Shield, Baby, UserPlus, ArrowLeft } from "lucide-react"
import { getVehiculeById, getCurrentUser, addReservation } from "@/mocks/mock"
import type { Vehicule, User } from "@/types"
import Link from "next/link"

export default function ReservationForm() {
  const params = useParams()
  const router = useRouter()
  const [vehicule, setVehicule] = useState<Vehicule | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    dateDebut: "",
    dateFin: "",
    options: {
      gps: false,
      assuranceComplete: false,
      siegeEnfant: false,
      conducteurSupplementaire: false,
    },
  })

  const optionsPrix = {
    gps: 5,
    assuranceComplete: 15,
    siegeEnfant: 8,
    conducteurSupplementaire: 10,
  }

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "client") {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      if (params.id) {
        const vehiculeId = Number.parseInt(params.id as string)
        const vehiculeData = await getVehiculeById(vehiculeId)
        setVehicule(vehiculeData)
      }
      setLoading(false)
    }

    loadData()
  }, [params.id, router])

  const calculateTotal = () => {
    if (!vehicule || !formData.dateDebut || !formData.dateFin) return 0

    const debut = new Date(formData.dateDebut)
    const fin = new Date(formData.dateFin)
    const jours = Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24))

    if (jours <= 0) return 0

    let total = vehicule.prixJournalier * jours

    // Ajouter les options
    Object.entries(formData.options).forEach(([option, selected]) => {
      if (selected) {
        total += optionsPrix[option as keyof typeof optionsPrix] * jours
      }
    })

    return total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicule || !user?.clientId) return

    setSubmitting(true)
    setError("")

    // Validation des dates
    const debut = new Date(formData.dateDebut)
    const fin = new Date(formData.dateFin)
    const aujourd = new Date()
    aujourd.setHours(0, 0, 0, 0)

    if (debut < aujourd) {
      setError("La date de début ne peut pas être dans le passé")
      setSubmitting(false)
      return
    }

    if (fin <= debut) {
      setError("La date de fin doit être après la date de début")
      setSubmitting(false)
      return
    }

    try {
      const reservation = await addReservation({
        clientId: user.clientId,
        vehiculeId: vehicule.id,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        statut: "confirmee",
        prixTotal: calculateTotal(),
        options: formData.options,
      })

      router.push(`/client/reservation/${reservation.id}`)
    } catch (err) {
      setError("Une erreur est survenue lors de la réservation")
    } finally {
      setSubmitting(false)
    }
  }

  const handleOptionChange = (option: keyof typeof formData.options, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [option]: checked,
      },
    }))
  }

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

  const total = calculateTotal()
  const jours =
    formData.dateDebut && formData.dateFin
      ? Math.ceil(
          (new Date(formData.dateFin).getTime() - new Date(formData.dateDebut).getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/vehicule/${vehicule.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux détails du véhicule
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations du véhicule */}
          <Card>
            <CardHeader>
              <CardTitle>Véhicule sélectionné</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Image
                  src={vehicule.image || "/placeholder.svg"}
                  alt={`${vehicule.marque} ${vehicule.modele}`}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-xl font-bold">
                    {vehicule.marque} {vehicule.modele}
                  </h3>
                  <p className="text-gray-600 capitalize">{vehicule.categorie}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{vehicule.prixJournalier}€/jour</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Équipements inclus :</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {vehicule.equipements.map((equipement, index) => (
                      <li key={index}>• {equipement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de réservation */}
          <Card>
            <CardHeader>
              <CardTitle>Réservation</CardTitle>
              <CardDescription>Complétez les informations de votre réservation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Date de début
                    </label>
                    <Input
                      type="date"
                      required
                      value={formData.dateDebut}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dateDebut: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Date de fin
                    </label>
                    <Input
                      type="date"
                      required
                      value={formData.dateFin}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dateFin: e.target.value }))}
                      min={formData.dateDebut || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {/* Options */}
                <div>
                  <h4 className="font-semibold mb-4">Options supplémentaires</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="gps"
                        checked={formData.options.gps}
                        onCheckedChange={(checked) => handleOptionChange("gps", checked as boolean)}
                      />
                      <div className="flex items-center flex-1">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <label htmlFor="gps" className="flex-1">
                          GPS
                        </label>
                        <span className="text-sm text-gray-600">+{optionsPrix.gps}€/jour</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="assurance"
                        checked={formData.options.assuranceComplete}
                        onCheckedChange={(checked) => handleOptionChange("assuranceComplete", checked as boolean)}
                      />
                      <div className="flex items-center flex-1">
                        <Shield className="h-4 w-4 mr-2 text-gray-500" />
                        <label htmlFor="assurance" className="flex-1">
                          Assurance complète
                        </label>
                        <span className="text-sm text-gray-600">+{optionsPrix.assuranceComplete}€/jour</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="siege"
                        checked={formData.options.siegeEnfant}
                        onCheckedChange={(checked) => handleOptionChange("siegeEnfant", checked as boolean)}
                      />
                      <div className="flex items-center flex-1">
                        <Baby className="h-4 w-4 mr-2 text-gray-500" />
                        <label htmlFor="siege" className="flex-1">
                          Siège enfant
                        </label>
                        <span className="text-sm text-gray-600">+{optionsPrix.siegeEnfant}€/jour</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="conducteur"
                        checked={formData.options.conducteurSupplementaire}
                        onCheckedChange={(checked) =>
                          handleOptionChange("conducteurSupplementaire", checked as boolean)
                        }
                      />
                      <div className="flex items-center flex-1">
                        <UserPlus className="h-4 w-4 mr-2 text-gray-500" />
                        <label htmlFor="conducteur" className="flex-1">
                          Conducteur supplémentaire
                        </label>
                        <span className="text-sm text-gray-600">+{optionsPrix.conducteurSupplementaire}€/jour</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Récapitulatif */}
                {jours > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Récapitulatif</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Durée de location</span>
                        <span>
                          {jours} jour{jours > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prix de base</span>
                        <span>{vehicule.prixJournalier * jours}€</span>
                      </div>
                      {Object.entries(formData.options).map(([option, selected]) => {
                        if (!selected) return null
                        const prix = optionsPrix[option as keyof typeof optionsPrix] * jours
                        const nom =
                          option === "gps"
                            ? "GPS"
                            : option === "assuranceComplete"
                              ? "Assurance complète"
                              : option === "siegeEnfant"
                                ? "Siège enfant"
                                : "Conducteur supplémentaire"
                        return (
                          <div key={option} className="flex justify-between">
                            <span>{nom}</span>
                            <span>+{prix}€</span>
                          </div>
                        )
                      })}
                      <div className="border-t pt-1 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{total}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={submitting || total === 0}>
                  {submitting ? "Réservation en cours..." : `Réserver pour ${total}€`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

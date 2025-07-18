"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser, addVehicule } from "@/mocks/mock"
import type { User, Vehicule } from "@/types"
import Sidebar from "@/components/sidebar"
import MultiStepForm from "@/components/multi-step-form"

export default function NouveauVehicule() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    marque: "",
    modele: "",
    categorie: "",
    prixJournalier: "",
    carburant: "",
    transmission: "",
    places: "",
    description: "",
    kilometrage: "",
    annee: "",
    equipements: [] as string[],
    disponible: true,
  })
  const router = useRouter()

  const equipementsDisponibles = [
    "Climatisation",
    "GPS",
    "Bluetooth",
    "Radio",
    "Caméra de recul",
    "Régulateur de vitesse",
    "Sièges chauffants",
    "Toit ouvrant",
    "Cuir",
    "Système audio premium",
    "Autopilot",
    "Écran tactile",
    "Superchargeur",
    "Aide au stationnement",
    "Détecteur d'angle mort",
    "Freinage d'urgence",
  ]

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "employe")) {
        router.push("/connexion")
        return
      }

      setUser(currentUser)
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")

    try {
      const vehiculeData: Omit<Vehicule, "id"> = {
        marque: formData.marque,
        modele: formData.modele,
        categorie: formData.categorie as any,
        prixJournalier: Number.parseInt(formData.prixJournalier),
        carburant: formData.carburant as any,
        transmission: formData.transmission as any,
        places: Number.parseInt(formData.places),
        description: formData.description,
        kilometrage: Number.parseInt(formData.kilometrage),
        annee: Number.parseInt(formData.annee),
        equipements: formData.equipements,
        disponible: formData.disponible,
        image: "/placeholder.svg?height=200&width=300",
      }

      await addVehicule(vehiculeData)
      router.push("/admin/vehicules")
    } catch (err) {
      setError("Une erreur est survenue lors de l'ajout du véhicule")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEquipementChange = (equipement: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      equipements: checked ? [...prev.equipements, equipement] : prev.equipements.filter((e) => e !== equipement),
    }))
  }

  const canProceed = (stepId: string) => {
    switch (stepId) {
      case "basic":
        return formData.marque && formData.modele && formData.categorie
      case "specs":
        return formData.carburant && formData.transmission && formData.places && formData.prixJournalier
      case "details":
        return formData.kilometrage && formData.annee
      case "review":
        return true
      default:
        return false
    }
  }

  const steps = [
    {
      id: "basic",
      title: "Informations de base",
      description: "Marque, modèle et catégorie du véhicule",
      component: (
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Marque <span className="text-red-500">*</span>
              </label>
              <Input
                name="marque"
                value={formData.marque}
                onChange={handleChange}
                placeholder="Toyota, Renault, BMW..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Modèle <span className="text-red-500">*</span>
              </label>
              <Input
                name="modele"
                value={formData.modele}
                onChange={handleChange}
                placeholder="Yaris, Clio, Série 3..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <Select value={formData.categorie} onValueChange={(value) => handleSelectChange("categorie", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economique">Économique</SelectItem>
                <SelectItem value="compacte">Compacte</SelectItem>
                <SelectItem value="berline">Berline</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="luxe">Luxe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: "specs",
      title: "Caractéristiques",
      description: "Spécifications techniques et prix",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Carburant <span className="text-red-500">*</span>
              </label>
              <Select value={formData.carburant} onValueChange={(value) => handleSelectChange("carburant", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de carburant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essence">Essence</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electrique">Électrique</SelectItem>
                  <SelectItem value="hybride">Hybride</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Transmission <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.transmission}
                onValueChange={(value) => handleSelectChange("transmission", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manuelle">Manuelle</SelectItem>
                  <SelectItem value="automatique">Automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre de places <span className="text-red-500">*</span>
              </label>
              <Select value={formData.places} onValueChange={(value) => handleSelectChange("places", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Nombre de places" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 places</SelectItem>
                  <SelectItem value="4">4 places</SelectItem>
                  <SelectItem value="5">5 places</SelectItem>
                  <SelectItem value="7">7 places</SelectItem>
                  <SelectItem value="9">9 places</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prix journalier (€) <span className="text-red-500">*</span>
              </label>
              <Input
                name="prixJournalier"
                type="number"
                min="1"
                value={formData.prixJournalier}
                onChange={handleChange}
                placeholder="25"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "details",
      title: "Détails",
      description: "Kilométrage, année et description",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Kilométrage <span className="text-red-500">*</span>
              </label>
              <Input
                name="kilometrage"
                type="number"
                min="0"
                value={formData.kilometrage}
                onChange={handleChange}
                placeholder="45000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Année <span className="text-red-500">*</span>
              </label>
              <Input
                name="annee"
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.annee}
                onChange={handleChange}
                placeholder="2023"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description du véhicule..."
              rows={4}
            />
          </div>
        </div>
      ),
    },
    {
      id: "equipment",
      title: "Équipements",
      description: "Sélectionnez les équipements disponibles",
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Équipements disponibles</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-4 border rounded-lg">
              {equipementsDisponibles.map((equipement) => (
                <div key={equipement} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipement}
                    checked={formData.equipements.includes(equipement)}
                    onCheckedChange={(checked) => handleEquipementChange(equipement, checked as boolean)}
                  />
                  <label htmlFor={equipement} className="text-sm">
                    {equipement}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="disponible"
              checked={formData.disponible}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, disponible: checked as boolean }))}
            />
            <label htmlFor="disponible" className="text-sm font-medium">
              Véhicule disponible à la location
            </label>
          </div>
        </div>
      ),
    },
    {
      id: "review",
      title: "Récapitulatif",
      description: "Vérifiez les informations avant de créer le véhicule",
      component: (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Informations du véhicule</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Marque:</span> {formData.marque}
              </div>
              <div>
                <span className="font-medium">Modèle:</span> {formData.modele}
              </div>
              <div>
                <span className="font-medium">Catégorie:</span> {formData.categorie}
              </div>
              <div>
                <span className="font-medium">Prix/jour:</span> {formData.prixJournalier}€
              </div>
              <div>
                <span className="font-medium">Carburant:</span> {formData.carburant}
              </div>
              <div>
                <span className="font-medium">Transmission:</span> {formData.transmission}
              </div>
              <div>
                <span className="font-medium">Places:</span> {formData.places}
              </div>
              <div>
                <span className="font-medium">Année:</span> {formData.annee}
              </div>
              <div>
                <span className="font-medium">Kilométrage:</span> {formData.kilometrage} km
              </div>
              <div>
                <span className="font-medium">Disponible:</span> {formData.disponible ? "Oui" : "Non"}
              </div>
            </div>

            {formData.description && (
              <div className="mt-3">
                <span className="font-medium">Description:</span>
                <p className="text-gray-600 mt-1">{formData.description}</p>
              </div>
            )}

            {formData.equipements.length > 0 && (
              <div className="mt-3">
                <span className="font-medium">Équipements:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.equipements.map((eq) => (
                    <span key={eq} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ]

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/admin/vehicules" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la gestion des véhicules
            </Link>
          </div>

          <MultiStepForm
            title="Ajouter un nouveau véhicule"
            description="Suivez les étapes pour ajouter un véhicule à votre flotte"
            steps={steps}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/vehicules")}
            isSubmitting={submitting}
            canProceed={canProceed}
          />
        </div>
      </div>
    </div>
  )
}

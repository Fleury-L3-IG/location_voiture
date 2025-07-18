"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser, getVehiculeById, updateVehicule } from "@/mocks/mock"
import type { User, Vehicule } from "@/types"
import Sidebar from "@/components/sidebar"
import MultiStepForm from "@/components/multi-step-form"

export default function ModifierVehicule() {
  const [user, setUser] = useState<User | null>(null)
  const [vehicule, setVehicule] = useState<Vehicule | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    marque: "",
    modele: "",
    categorie: "economique" as const,
    prixJournalier: 0,
    carburant: "essence" as const,
    transmission: "manuelle" as const,
    places: 5,
    description: "",
    equipements: [] as string[],
    kilometrage: 0,
    annee: new Date().getFullYear(),
    disponible: true,
  })
  const router = useRouter()
  const params = useParams()
  const vehiculeId = Number.parseInt(params.id as string)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      const vehiculeData = await getVehiculeById(vehiculeId)
      if (!vehiculeData) {
        router.push("/admin/vehicules")
        return
      }

      setVehicule(vehiculeData)
      setFormData({
        marque: vehiculeData.marque,
        modele: vehiculeData.modele,
        categorie: vehiculeData.categorie,
        prixJournalier: vehiculeData.prixJournalier,
        carburant: vehiculeData.carburant,
        transmission: vehiculeData.transmission,
        places: vehiculeData.places,
        description: vehiculeData.description,
        equipements: vehiculeData.equipements,
        kilometrage: vehiculeData.kilometrage,
        annee: vehiculeData.annee,
        disponible: vehiculeData.disponible,
      })
      setLoading(false)
    }

    loadData()
  }, [router, vehiculeId])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")

    try {
      const vehiculeData: Partial<Vehicule> = {
        marque: formData.marque,
        modele: formData.modele,
        categorie: formData.categorie,
        prixJournalier: formData.prixJournalier,
        carburant: formData.carburant,
        transmission: formData.transmission,
        places: formData.places,
        description: formData.description,
        equipements: formData.equipements,
        kilometrage: formData.kilometrage,
        annee: formData.annee,
        disponible: formData.disponible,
      }

      await updateVehicule(vehiculeId, vehiculeData)
      router.push("/admin/vehicules")
    } catch (err) {
      setError("Une erreur est survenue lors de la modification du véhicule")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
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
      case "technical":
        return formData.carburant && formData.transmission && formData.places > 0
      case "pricing":
        return formData.prixJournalier > 0 && formData.annee > 1900
      case "details":
        return formData.description.length > 10
      case "review":
        return true
      default:
        return false
    }
  }

  const equipementsDisponibles = [
    "Climatisation",
    "GPS",
    "Bluetooth",
    "Caméra de recul",
    "Régulateur de vitesse",
    "Sièges chauffants",
    "Toit ouvrant",
    "Système audio premium",
    "USB",
    "Cuir",
    "Jantes alliage",
    "Feux LED",
  ]

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
                <SelectValue />
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="disponible"
              checked={formData.disponible}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, disponible: !!checked }))}
            />
            <label htmlFor="disponible" className="text-sm font-medium">
              Véhicule disponible à la location
            </label>
          </div>
        </div>
      ),
    },
    {
      id: "technical",
      title: "Caractéristiques techniques",
      description: "Carburant, transmission et nombre de places",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Type de carburant <span className="text-red-500">*</span>
              </label>
              <Select value={formData.carburant} onValueChange={(value) => handleSelectChange("carburant", value)}>
                <SelectTrigger>
                  <SelectValue />
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
                  <SelectValue />
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
              <Input name="places" type="number" min="2" max="9" value={formData.places} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kilométrage</label>
              <Input
                name="kilometrage"
                type="number"
                min="0"
                value={formData.kilometrage}
                onChange={handleChange}
                placeholder="45000"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "pricing",
      title: "Tarification",
      description: "Prix journalier et année du véhicule",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Prix journalier (€) <span className="text-red-500">*</span>
              </label>
              <Input
                name="prixJournalier"
                type="number"
                min="1"
                step="0.01"
                value={formData.prixJournalier}
                onChange={handleChange}
                placeholder="25.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Année <span className="text-red-500">*</span>
              </label>
              <Input
                name="annee"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.annee}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800">Suggestions de prix par catégorie</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-700">
              <div>Économique: 20-35€</div>
              <div>Compacte: 30-45€</div>
              <div>Berline: 50-80€</div>
              <div>SUV: 60-100€</div>
              <div>Luxe: 80-150€</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "details",
      title: "Description et équipements",
      description: "Détails du véhicule et équipements inclus",
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez les caractéristiques et avantages du véhicule..."
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500 caractères (minimum 10)</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Équipements inclus</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {equipementsDisponibles.map((equipement) => (
                <div key={equipement} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipement}
                    checked={formData.equipements.includes(equipement)}
                    onCheckedChange={(checked) => handleEquipementChange(equipement, !!checked)}
                  />
                  <label htmlFor={equipement} className="text-sm">
                    {equipement}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "review",
      title: "Récapitulatif",
      description: "Vérifiez les informations avant de modifier le véhicule",
      component: (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Informations du véhicule</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Véhicule:</span> {formData.marque} {formData.modele}
              </div>
              <div>
                <span className="font-medium">Catégorie:</span> {formData.categorie}
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
                <span className="font-medium">Prix/jour:</span> {formData.prixJournalier}€
              </div>
              <div>
                <span className="font-medium">Année:</span> {formData.annee}
              </div>
              <div>
                <span className="font-medium">Kilométrage:</span> {formData.kilometrage.toLocaleString()} km
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-gray-600">{formData.description}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Équipements ({formData.equipements.length})</h4>
            <div className="flex flex-wrap gap-2">
              {formData.equipements.map((equipement) => (
                <span key={equipement} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {equipement}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-green-800">Statut</h4>
            <p className="text-sm text-green-700">
              {formData.disponible ? "✅ Disponible à la location" : "❌ Non disponible"}
            </p>
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
            title={`Modifier ${vehicule?.marque} ${vehicule?.modele}`}
            description="Modifiez les informations du véhicule en suivant les étapes"
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

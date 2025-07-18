"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser, getAgenceById, updateAgence } from "@/mocks/mock"
import type { User, Agence } from "@/types"
import Sidebar from "@/components/sidebar"
import MultiStepForm from "@/components/multi-step-form"

export default function ModifierAgence() {
  const [user, setUser] = useState<User | null>(null)
  const [agence, setAgence] = useState<Agence | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    nom: "",
    adresse: "",
    telephone: "",
    email: "",
    heuresOuverture: "",
  })
  const router = useRouter()
  const params = useParams()
  const agenceId = Number.parseInt(params.id as string)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      const agenceData = await getAgenceById(agenceId)
      if (!agenceData) {
        router.push("/admin/agences")
        return
      }

      setAgence(agenceData)
      setFormData({
        nom: agenceData.nom,
        adresse: agenceData.adresse,
        telephone: agenceData.telephone,
        email: agenceData.email,
        heuresOuverture: agenceData.heuresOuverture,
      })
      setLoading(false)
    }

    loadData()
  }, [router, agenceId])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")

    try {
      const agenceData: Partial<Agence> = {
        nom: formData.nom,
        adresse: formData.adresse,
        telephone: formData.telephone,
        email: formData.email,
        heuresOuverture: formData.heuresOuverture,
      }

      await updateAgence(agenceId, agenceData)
      router.push("/admin/agences")
    } catch (err) {
      setError("Une erreur est survenue lors de la modification de l'agence")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const canProceed = (stepId: string) => {
    switch (stepId) {
      case "basic":
        return formData.nom && formData.adresse
      case "contact":
        return formData.telephone && formData.email
      case "hours":
        return formData.heuresOuverture
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
      description: "Nom et adresse de l'agence",
      component: (
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Nom de l'agence <span className="text-red-500">*</span>
            </label>
            <Input
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Agence Centrale, Agence Nord..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Adresse complète <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              placeholder="123 Rue de la République, 75001 Paris"
              rows={3}
            />
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      title: "Informations de contact",
      description: "Téléphone et email de l'agence",
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <Input
              name="telephone"
              type="tel"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="01 23 45 67 89"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@agence.com"
            />
          </div>
        </div>
      ),
    },
    {
      id: "hours",
      title: "Horaires d'ouverture",
      description: "Définissez les horaires de l'agence",
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Horaires d'ouverture <span className="text-red-500">*</span>
            </label>
            <Input
              name="heuresOuverture"
              value={formData.heuresOuverture}
              onChange={handleChange}
              placeholder="8h-18h du lundi au samedi"
            />
            <p className="text-sm text-gray-500 mt-1">Exemple: "8h-18h du lundi au samedi" ou "24h/24 7j/7"</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800">Suggestions d'horaires</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <button
                type="button"
                className="block w-full text-left hover:bg-blue-100 p-2 rounded"
                onClick={() => setFormData((prev) => ({ ...prev, heuresOuverture: "8h-18h du lundi au samedi" }))}
              >
                8h-18h du lundi au samedi
              </button>
              <button
                type="button"
                className="block w-full text-left hover:bg-blue-100 p-2 rounded"
                onClick={() => setFormData((prev) => ({ ...prev, heuresOuverture: "9h-19h du lundi au dimanche" }))}
              >
                9h-19h du lundi au dimanche
              </button>
              <button
                type="button"
                className="block w-full text-left hover:bg-blue-100 p-2 rounded"
                onClick={() => setFormData((prev) => ({ ...prev, heuresOuverture: "24h/24 7j/7" }))}
              >
                24h/24 7j/7
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "review",
      title: "Récapitulatif",
      description: "Vérifiez les informations avant de modifier l'agence",
      component: (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Informations de l'agence</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Nom:</span> {formData.nom}
              </div>
              <div>
                <span className="font-medium">Adresse:</span>
                <p className="text-gray-600 mt-1">{formData.adresse}</p>
              </div>
              <div>
                <span className="font-medium">Téléphone:</span> {formData.telephone}
              </div>
              <div>
                <span className="font-medium">Email:</span> {formData.email}
              </div>
              <div>
                <span className="font-medium">Horaires:</span> {formData.heuresOuverture}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-yellow-800">Informations importantes</h4>
            <div className="text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Les modifications prendront effet immédiatement</li>
                <li>Les employés de cette agence seront notifiés des changements</li>
                <li>Les clients pourront voir les nouvelles informations</li>
                <li>L'historique des modifications sera conservé</li>
              </ul>
            </div>
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
            <Link href="/admin/agences" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la gestion des agences
            </Link>
          </div>

          <MultiStepForm
            title={`Modifier ${agence?.nom}`}
            description="Modifiez les informations de l'agence en suivant les étapes"
            steps={steps}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/agences")}
            isSubmitting={submitting}
            canProceed={canProceed}
          />
        </div>
      </div>
    </div>
  )
}

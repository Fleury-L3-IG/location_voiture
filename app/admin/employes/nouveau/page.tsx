"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser, addEmploye, addUser } from "@/mocks/mock"
import type { User, Employe } from "@/types"
import Sidebar from "@/components/sidebar"
import MultiStepForm from "@/components/multi-step-form"

export default function NouvelEmploye() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "",
    agenceId: "1",
    dateEmbauche: new Date().toISOString().split("T")[0],
    motDePasse: "",
    confirmMotDePasse: "",
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
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")

    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError("Les mots de passe ne correspondent pas")
      setSubmitting(false)
      return
    }

    try {
      const employeData: Omit<Employe, "id"> = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role as "admin" | "employe",
        agenceId: Number.parseInt(formData.agenceId),
        dateEmbauche: formData.dateEmbauche,
      }

      const newEmploye = await addEmploye(employeData)

      // Créer le compte utilisateur
      await addUser({
        email: formData.email,
        role: formData.role as "admin" | "employe",
        motDePasse: formData.motDePasse,
        employeId: newEmploye.id,
      })

      router.push("/admin/employes")
    } catch (err) {
      setError("Une erreur est survenue lors de l'ajout de l'employé")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const canProceed = (stepId: string) => {
    switch (stepId) {
      case "personal":
        return formData.nom && formData.prenom && formData.email
      case "professional":
        return formData.role && formData.agenceId && formData.dateEmbauche
      case "security":
        return formData.motDePasse && formData.confirmMotDePasse && formData.motDePasse.length >= 6
      case "review":
        return formData.motDePasse === formData.confirmMotDePasse
      default:
        return false
    }
  }

  const steps = [
    {
      id: "personal",
      title: "Informations personnelles",
      description: "Nom, prénom et email de l'employé",
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
                Nom <span className="text-red-500">*</span>
              </label>
              <Input name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom de famille" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <Input name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email professionnel <span className="text-red-500">*</span>
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@agence.com"
            />
          </div>
        </div>
      ),
    },
    {
      id: "professional",
      title: "Informations professionnelles",
      description: "Rôle, agence et date d'embauche",
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Rôle <span className="text-red-500">*</span>
            </label>
            <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employe">Employé</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Agence <span className="text-red-500">*</span>
            </label>
            <Select value={formData.agenceId} onValueChange={(value) => handleSelectChange("agenceId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une agence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Agence Centrale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Date d'embauche <span className="text-red-500">*</span>
            </label>
            <Input name="dateEmbauche" type="date" value={formData.dateEmbauche} onChange={handleChange} />
          </div>
        </div>
      ),
    },
    {
      id: "security",
      title: "Sécurité",
      description: "Mot de passe pour le compte utilisateur",
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <Input
              name="motDePasse"
              type="password"
              value={formData.motDePasse}
              onChange={handleChange}
              placeholder="Minimum 6 caractères"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <Input
              name="confirmMotDePasse"
              type="password"
              value={formData.confirmMotDePasse}
              onChange={handleChange}
              placeholder="Confirmez le mot de passe"
            />
          </div>

          {formData.motDePasse && formData.confirmMotDePasse && formData.motDePasse !== formData.confirmMotDePasse && (
            <Alert variant="destructive">
              <AlertDescription>Les mots de passe ne correspondent pas</AlertDescription>
            </Alert>
          )}
        </div>
      ),
    },
    {
      id: "review",
      title: "Récapitulatif",
      description: "Vérifiez les informations avant de créer l'employé",
      component: (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Informations de l'employé</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nom:</span> {formData.nom}
              </div>
              <div>
                <span className="font-medium">Prénom:</span> {formData.prenom}
              </div>
              <div>
                <span className="font-medium">Email:</span> {formData.email}
              </div>
              <div>
                <span className="font-medium">Rôle:</span> {formData.role === "admin" ? "Administrateur" : "Employé"}
              </div>
              <div>
                <span className="font-medium">Agence:</span> Agence Centrale
              </div>
              <div>
                <span className="font-medium">Date d'embauche:</span>{" "}
                {new Date(formData.dateEmbauche).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800">Permissions</h4>
            <div className="text-sm text-blue-700">
              {formData.role === "admin" ? (
                <ul className="list-disc list-inside space-y-1">
                  <li>Accès complet à l'administration</li>
                  <li>Gestion des véhicules, clients et employés</li>
                  <li>Accès aux rapports et statistiques</li>
                  <li>Gestion des paiements</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  <li>Accès aux réservations</li>
                  <li>Consultation des véhicules et clients</li>
                  <li>Gestion des check-in/check-out</li>
                </ul>
              )}
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
            <Link href="/admin/employes" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la gestion des employés
            </Link>
          </div>

          <MultiStepForm
            title="Ajouter un nouvel employé"
            description="Suivez les étapes pour créer un compte employé"
            steps={steps}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/employes")}
            isSubmitting={submitting}
            canProceed={canProceed}
          />
        </div>
      </div>
    </div>
  )
}

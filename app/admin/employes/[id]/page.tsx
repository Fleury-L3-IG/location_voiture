"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser, getEmployeById, updateEmploye, getAgences } from "@/mocks/mock"
import type { User, Employe, Agence } from "@/types"
import Sidebar from "@/components/sidebar"
import MultiStepForm from "@/components/multi-step-form"

export default function ModifierEmploye() {
  const [user, setUser] = useState<User | null>(null)
  const [employe, setEmploye] = useState<Employe | null>(null)
  const [agences, setAgences] = useState<Agence[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "employe" as const,
    agenceId: 1,
  })
  const router = useRouter()
  const params = useParams()
  const employeId = Number.parseInt(params.id as string)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      const [employeData, agencesData] = await Promise.all([getEmployeById(employeId), getAgences()])

      if (!employeData) {
        router.push("/admin/employes")
        return
      }

      setEmploye(employeData)
      setAgences(agencesData)
      setFormData({
        nom: employeData.nom,
        prenom: employeData.prenom,
        email: employeData.email,
        role: employeData.role,
        agenceId: employeData.agenceId,
      })
      setLoading(false)
    }

    loadData()
  }, [router, employeId])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")

    try {
      const employeData: Partial<Employe> = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role,
        agenceId: formData.agenceId,
      }

      await updateEmploye(employeId, employeData)
      router.push("/admin/employes")
    } catch (err) {
      setError("Une erreur est survenue lors de la modification de l'employé")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: name === "agenceId" ? Number.parseInt(value) : value }))
  }

  const canProceed = (stepId: string) => {
    switch (stepId) {
      case "personal":
        return formData.nom && formData.prenom
      case "professional":
        return formData.email && formData.role && formData.agenceId
      case "review":
        return true
      default:
        return false
    }
  }

  const steps = [
    {
      id: "personal",
      title: "Informations personnelles",
      description: "Nom et prénom de l'employé",
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
              <Input name="nom" value={formData.nom} onChange={handleChange} placeholder="Dupont" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <Input name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Jean" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "professional",
      title: "Informations professionnelles",
      description: "Email, rôle et agence d'affectation",
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email professionnel <span className="text-red-500">*</span>
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jean.dupont@agence.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Rôle <span className="text-red-500">*</span>
              </label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employe">Employé</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Agence d'affectation <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.agenceId.toString()}
                onValueChange={(value) => handleSelectChange("agenceId", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agences.map((agence) => (
                    <SelectItem key={agence.id} value={agence.id.toString()}>
                      {agence.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800">Rôles et permissions</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div>
                <strong>Employé:</strong> Accès aux réservations et clients de son agence
              </div>
              <div>
                <strong>Administrateur:</strong> Accès complet à toutes les fonctionnalités
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "review",
      title: "Récapitulatif",
      description: "Vérifiez les informations avant de modifier l'employé",
      component: (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Informations de l'employé</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Nom complet:</span> {formData.prenom} {formData.nom}
              </div>
              <div>
                <span className="font-medium">Email:</span> {formData.email}
              </div>
              <div>
                <span className="font-medium">Rôle:</span>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    formData.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {formData.role === "admin" ? "Administrateur" : "Employé"}
                </span>
              </div>
              <div>
                <span className="font-medium">Agence:</span> {agences.find((a) => a.id === formData.agenceId)?.nom}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-yellow-800">Informations importantes</h4>
            <div className="text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>L'employé conservera son mot de passe actuel</li>
                <li>Les modifications prendront effet immédiatement</li>
                <li>Un email de notification sera envoyé à l'employé</li>
                {formData.role === "admin" && (
                  <li className="font-medium">⚠️ Ce rôle donne accès à toutes les fonctionnalités</li>
                )}
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
            <Link href="/admin/employes" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la gestion des employés
            </Link>
          </div>

          <MultiStepForm
            title={`Modifier ${employe?.prenom} ${employe?.nom}`}
            description="Modifiez les informations de l'employé en suivant les étapes"
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

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Car } from "lucide-react"
import { register } from "@/mocks/mock"

export default function Inscription() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    dateNaissance: "",
    numeroPermis: "",
    adresse: "",
    motDePasse: "",
    confirmMotDePasse: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    if (formData.motDePasse.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setLoading(false)
      return
    }

    try {
      const { confirmMotDePasse, motDePasse, ...clientData } = formData
      const user = await register(formData.email, motDePasse, clientData)

      if (user) {
        router.push("/client/dashboard")
      } else {
        setError("Cet email est déjà utilisé")
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Car className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Créer votre compte</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{" "}
            <Link href="/connexion" className="font-medium text-blue-600 hover:text-blue-500">
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>Remplissez vos informations pour créer votre compte client</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <Input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <Input
                    id="prenom"
                    name="prenom"
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <Input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    required
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance *
                  </label>
                  <Input
                    id="dateNaissance"
                    name="dateNaissance"
                    type="date"
                    required
                    value={formData.dateNaissance}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="numeroPermis" className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de permis *
                </label>
                <Input
                  id="numeroPermis"
                  name="numeroPermis"
                  type="text"
                  required
                  value={formData.numeroPermis}
                  onChange={handleChange}
                  placeholder="Numéro de votre permis de conduire"
                />
              </div>

              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse *
                </label>
                <Input
                  id="adresse"
                  name="adresse"
                  type="text"
                  required
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Votre adresse complète"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Input
                      id="motDePasse"
                      name="motDePasse"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.motDePasse}
                      onChange={handleChange}
                      placeholder="Minimum 6 caractères"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmMotDePasse" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmMotDePasse"
                      name="confirmMotDePasse"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmMotDePasse}
                      onChange={handleChange}
                      placeholder="Confirmez votre mot de passe"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création du compte..." : "Créer mon compte"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

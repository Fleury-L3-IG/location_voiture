"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { User, Star, Calendar, Phone, Mail, MapPin, CreditCard } from "lucide-react"
import { getCurrentUser, getClientById, updateClient } from "@/mocks/mock"
import type { User as UserType, Client } from "@/types"

export default function ProfilClient() {
  const [user, setUser] = useState<UserType | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    dateNaissance: "",
    numeroPermis: "",
    adresse: "",
  })
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "client") {
        router.push("/connexion")
        return
      }

      setUser(currentUser)

      if (currentUser.clientId) {
        const clientData = await getClientById(currentUser.clientId)
        if (clientData) {
          setClient(clientData)
          setFormData({
            nom: clientData.nom,
            prenom: clientData.prenom,
            email: clientData.email,
            telephone: clientData.telephone,
            dateNaissance: clientData.dateNaissance,
            numeroPermis: clientData.numeroPermis,
            adresse: clientData.adresse,
          })
        }
      }
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return

    setSaving(true)
    setMessage("")

    try {
      const updatedClient = await updateClient(client.id, formData)
      if (updatedClient) {
        setClient(updatedClient)
        setEditing(false)
        setMessage("Profil mis à jour avec succès !")
      } else {
        setMessage("Erreur lors de la mise à jour du profil")
      }
    } catch (err) {
      setMessage("Une erreur est survenue")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleCancel = () => {
    if (client) {
      setFormData({
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone,
        dateNaissance: client.dateNaissance,
        numeroPermis: client.numeroPermis,
        adresse: client.adresse,
      })
    }
    setEditing(false)
    setMessage("")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <Button onClick={() => router.push("/client/dashboard")}>Retour au tableau de bord</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon profil</h1>
          <p className="text-lg text-gray-600">Gérez vos informations personnelles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informations personnelles
                    </CardTitle>
                    <CardDescription>Vos données personnelles et de contact</CardDescription>
                  </div>
                  {!editing && (
                    <Button onClick={() => setEditing(true)} variant="outline">
                      Modifier
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {message && (
                  <Alert className={`mb-4 ${message.includes("succès") ? "border-green-500" : "border-red-500"}`}>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nom *</label>
                        <Input
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          required
                          placeholder="Votre nom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Prénom *</label>
                        <Input
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleChange}
                          required
                          placeholder="Votre prénom"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email *</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Téléphone *</label>
                        <Input
                          name="telephone"
                          type="tel"
                          value={formData.telephone}
                          onChange={handleChange}
                          required
                          placeholder="0123456789"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Date de naissance *</label>
                        <Input
                          name="dateNaissance"
                          type="date"
                          value={formData.dateNaissance}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Numéro de permis *</label>
                      <Input
                        name="numeroPermis"
                        value={formData.numeroPermis}
                        onChange={handleChange}
                        required
                        placeholder="Numéro de votre permis de conduire"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Adresse *</label>
                      <Input
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        required
                        placeholder="Votre adresse complète"
                      />
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" disabled={saving}>
                        {saving ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nom</label>
                        <p className="text-lg">{client.nom}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Prénom</label>
                        <p className="text-lg">{client.prenom}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email
                      </label>
                      <p className="text-lg">{client.email}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          <Phone className="h-4 w-4 inline mr-1" />
                          Téléphone
                        </label>
                        <p className="text-lg">{client.telephone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Date de naissance
                        </label>
                        <p className="text-lg">{new Date(client.dateNaissance).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        <CreditCard className="h-4 w-4 inline mr-1" />
                        Numéro de permis
                      </label>
                      <p className="text-lg">{client.numeroPermis}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Adresse
                      </label>
                      <p className="text-lg">{client.adresse}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques du compte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Programme de fidélité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{client.pointsFidelite}</div>
                  <p className="text-sm text-gray-600 mb-4">Points de fidélité</p>
                  <Badge variant="outline" className="mb-4">
                    {client.pointsFidelite >= 500
                      ? "Client VIP"
                      : client.pointsFidelite >= 200
                        ? "Client Gold"
                        : client.pointsFidelite >= 100
                          ? "Client Silver"
                          : "Client Standard"}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    <p>100 points = 10€ de réduction</p>
                    <p>
                      Prochain niveau à{" "}
                      {client.pointsFidelite >= 500
                        ? "500"
                        : client.pointsFidelite >= 200
                          ? "500"
                          : client.pointsFidelite >= 100
                            ? "200"
                            : "100"}{" "}
                      points
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations du compte */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Membre depuis</span>
                    <span className="font-medium">{new Date(client.dateInscription).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut</span>
                    <Badge variant="default">Actif</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type de compte</span>
                    <span className="font-medium">Client</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/client/reservations">
                    <Calendar className="h-4 w-4 mr-2" />
                    Mes réservations
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/client/factures">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Mes factures
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/catalogue">
                    <Star className="h-4 w-4 mr-2" />
                    Réserver un véhicule
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

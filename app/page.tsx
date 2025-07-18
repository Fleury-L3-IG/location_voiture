import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Shield, Clock, Star } from "lucide-react"

export default function Home() {
  const categories = [
    {
      name: "Économique",
      description: "Parfait pour la ville",
      price: "À partir de 25€/jour",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Compacte",
      description: "Confort et économie",
      price: "À partir de 30€/jour",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Berline",
      description: "Espace et élégance",
      price: "À partir de 50€/jour",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "SUV",
      description: "Aventure et famille",
      price: "À partir de 60€/jour",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const features = [
    {
      icon: Car,
      title: "Large flotte",
      description: "Plus de 100 véhicules disponibles",
    },
    {
      icon: Shield,
      title: "Assurance incluse",
      description: "Protection complète pour votre tranquillité",
    },
    {
      icon: Clock,
      title: "Service 24h/24",
      description: "Assistance disponible à tout moment",
    },
    {
      icon: Star,
      title: "Satisfaction client",
      description: "4.8/5 étoiles de satisfaction",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Louez votre voiture idéale</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Des véhicules de qualité pour tous vos déplacements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalogue">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Voir le catalogue
                </Button>
              </Link>
              <Link href="/inscription">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos catégories de véhicules</h2>
            <p className="text-lg text-gray-600">Trouvez le véhicule parfait pour vos besoins</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{category.name}</CardTitle>
                  <CardDescription className="mb-2">{category.description}</CardDescription>
                  <p className="text-blue-600 font-semibold">{category.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi nous choisir ?</h2>
            <p className="text-lg text-gray-600">Des services de qualité pour une expérience exceptionnelle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à partir à l'aventure ?</h2>
          <p className="text-xl mb-8 text-blue-100">Réservez dès maintenant et profitez de nos tarifs préférentiels</p>
          <Link href="/catalogue">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Réserver maintenant
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

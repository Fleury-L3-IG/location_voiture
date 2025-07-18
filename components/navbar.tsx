"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Car, User, LogOut, Menu, X } from "lucide-react"
import { getCurrentUser, logout } from "@/mocks/mock"
import type { User as UserType } from "@/types"

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    router.push("/")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CarRental</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Accueil
            </Link>
            <Link href="/catalogue" className="text-gray-700 hover:text-blue-600 transition-colors">
              Catalogue
            </Link>
            <Link href="/avis" className="text-gray-700 hover:text-blue-600 transition-colors">
              Avis
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === "client" && (
                  <Link href="/client/dashboard">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Mon Espace
                    </Button>
                  </Link>
                )}
                {(user.role === "admin" || user.role === "employe") && (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Administration
                    </Button>
                  </Link>
                )}
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/connexion">
                  <Button variant="outline" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/inscription">
                  <Button size="sm">Inscription</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Accueil
              </Link>
              <Link href="/catalogue" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Catalogue
              </Link>
              <Link href="/avis" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Avis
              </Link>

              {user ? (
                <div className="space-y-1">
                  {user.role === "client" && (
                    <Link href="/client/dashboard" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                      Mon Espace
                    </Link>
                  )}
                  {(user.role === "admin" || user.role === "employe") && (
                    <Link href="/admin/dashboard" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                      Administration
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link href="/connexion" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Connexion
                  </Link>
                  <Link href="/inscription" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

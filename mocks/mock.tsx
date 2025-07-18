import type { Vehicule, Client, Reservation, Employe, Paiement, Avis, User, Agence } from "@/types"

// Données simulées
export const vehicules: Vehicule[] = [
  {
    id: 1,
    marque: "Toyota",
    modele: "Yaris",
    categorie: "economique",
    prixJournalier: 25,
    disponible: true,
    carburant: "essence",
    transmission: "manuelle",
    places: 5,
    image: "/placeholder.svg?height=200&width=300",
    description: "Véhicule économique parfait pour la ville",
    equipements: ["Climatisation", "Radio", "Bluetooth"],
    kilometrage: 45000,
    annee: 2022,
  },
  {
    id: 2,
    marque: "Renault",
    modele: "Clio",
    categorie: "compacte",
    prixJournalier: 30,
    disponible: true,
    carburant: "diesel",
    transmission: "automatique",
    places: 5,
    image: "/placeholder.svg?height=200&width=300",
    description: "Compacte confortable avec équipements modernes",
    equipements: ["GPS", "Climatisation", "Caméra de recul"],
    kilometrage: 32000,
    annee: 2023,
  },
  {
    id: 3,
    marque: "BMW",
    modele: "Série 3",
    categorie: "berline",
    prixJournalier: 65,
    disponible: false,
    carburant: "essence",
    transmission: "automatique",
    places: 5,
    image: "/placeholder.svg?height=200&width=300",
    description: "Berline premium pour un confort optimal",
    equipements: ["GPS", "Cuir", "Toit ouvrant", "Système audio premium"],
    kilometrage: 28000,
    annee: 2023,
  },
  {
    id: 4,
    marque: "Tesla",
    modele: "Model 3",
    categorie: "luxe",
    prixJournalier: 85,
    disponible: true,
    carburant: "electrique",
    transmission: "automatique",
    places: 5,
    image: "/placeholder.svg?height=200&width=300",
    description: "Véhicule électrique haut de gamme",
    equipements: ["Autopilot", "Écran tactile", "Superchargeur"],
    kilometrage: 15000,
    annee: 2024,
  },
]

export const clients: Client[] = [
  {
    id: 1,
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@email.com",
    telephone: "0123456789",
    dateNaissance: "1985-05-15",
    numeroPermis: "123456789",
    adresse: "123 Rue de la Paix, Paris",
    pointsFidelite: 150,
    dateInscription: "2023-01-15",
  },
  {
    id: 2,
    nom: "Martin",
    prenom: "Marie",
    email: "marie.martin@email.com",
    telephone: "0987654321",
    dateNaissance: "1990-08-22",
    numeroPermis: "987654321",
    adresse: "456 Avenue des Champs, Lyon",
    pointsFidelite: 75,
    dateInscription: "2023-03-10",
  },
]

export const reservations: Reservation[] = [
  {
    id: 1,
    clientId: 1,
    vehiculeId: 1,
    dateDebut: "2024-01-20",
    dateFin: "2024-01-25",
    statut: "confirmee",
    prixTotal: 125,
    options: {
      gps: true,
      assuranceComplete: false,
      siegeEnfant: false,
      conducteurSupplementaire: false,
    },
    dateReservation: "2024-01-15",
    qrCode: "QR123456789",
  },
  {
    id: 2,
    clientId: 2,
    vehiculeId: 2,
    dateDebut: "2024-01-18",
    dateFin: "2024-01-22",
    statut: "en_cours",
    prixTotal: 120,
    options: {
      gps: false,
      assuranceComplete: true,
      siegeEnfant: true,
      conducteurSupplementaire: false,
    },
    dateReservation: "2024-01-10",
    qrCode: "QR987654321",
  },
]

export const employes: Employe[] = [
  {
    id: 1,
    nom: "Admin",
    prenom: "Super",
    email: "admin@agence.com",
    role: "admin",
    agenceId: 1,
    dateEmbauche: "2020-01-01",
  },
  {
    id: 2,
    nom: "Employe",
    prenom: "Test",
    email: "employe@agence.com",
    role: "employe",
    agenceId: 1,
    dateEmbauche: "2022-06-15",
  },
]

export const paiements: Paiement[] = [
  {
    id: 1,
    reservationId: 1,
    montant: 125,
    statut: "paye",
    methodePaiement: "carte",
    datePaiement: "2024-01-15",
  },
  {
    id: 2,
    reservationId: 2,
    montant: 120,
    statut: "en_attente",
    methodePaiement: "carte",
    datePaiement: "2024-01-10",
  },
]

export const avis: Avis[] = [
  {
    id: 1,
    clientId: 1,
    vehiculeId: 1,
    note: 5,
    commentaire: "Excellent véhicule, très économique et fiable!",
    dateAvis: "2024-01-26",
  },
  {
    id: 2,
    clientId: 2,
    vehiculeId: 2,
    note: 4,
    commentaire: "Bonne voiture, confortable pour les trajets urbains.",
    dateAvis: "2024-01-23",
  },
]

export const users: User[] = [
  {
    id: 1,
    email: "admin@agence.com",
    role: "admin",
    motDePasse: "admin123",
    employeId: 1,
  },
  {
    id: 2,
    email: "jean.dupont@email.com",
    role: "client",
    motDePasse: "client123",
    clientId: 1,
  },
  {
    id: 3,
    email: "marie.martin@email.com",
    role: "client",
    motDePasse: "client123",
    clientId: 2,
  },
]

export const agences: Agence[] = [
  {
    id: 1,
    nom: "Agence Centrale",
    adresse: "100 Boulevard Principal, Paris",
    telephone: "0145678901",
    email: "contact@agence.com",
    heuresOuverture: "8h-18h du lundi au samedi",
  },
  {
    id: 2,
    nom: "Agence Nord",
    adresse: "25 Avenue du Nord, Lille",
    telephone: "0320456789",
    email: "lille@agence.com",
    heuresOuverture: "9h-19h du lundi au dimanche",
  },
  {
    id: 3,
    nom: "Agence Sud",
    adresse: "50 Boulevard de la Méditerranée, Marseille",
    telephone: "0491234567",
    email: "marseille@agence.com",
    heuresOuverture: "8h-20h du lundi au samedi",
  },
]

// --- Agences -------------------------------------------------------------

export const getAgences = (): Promise<Agence[]> => {
  return Promise.resolve([...agences])
}

export const getAgenceById = (id: number): Promise<Agence | null> => {
  const agence = agences.find((a) => a.id === id)
  return Promise.resolve(agence || null)
}

export const addAgence = (agence: Omit<Agence, "id">): Promise<Agence> => {
  const newAgence = { ...agence, id: Math.max(...agences.map((a) => a.id)) + 1 }
  agences.push(newAgence)
  return Promise.resolve(newAgence)
}

export const updateAgence = (id: number, updates: Partial<Agence>): Promise<Agence | null> => {
  const index = agences.findIndex((a) => a.id === id)
  if (index !== -1) {
    agences[index] = { ...agences[index], ...updates }
    return Promise.resolve(agences[index])
  }
  return Promise.resolve(null)
}

export const deleteAgence = (id: number): Promise<boolean> => {
  const index = agences.findIndex((a) => a.id === id)
  if (index !== -1) {
    agences.splice(index, 1)
    return Promise.resolve(true)
  }
  return Promise.resolve(false)
}

// --- Véhicules -----------------------------------------------------------

export const getVehicules = (): Promise<Vehicule[]> => {
  return Promise.resolve([...vehicules])
}

export const getVehiculeById = (id: number): Promise<Vehicule | null> => {
  const vehicule = vehicules.find((v) => v.id === id)
  return Promise.resolve(vehicule || null)
}

export const addVehicule = (vehicule: Omit<Vehicule, "id">): Promise<Vehicule> => {
  const newVehicule = { ...vehicule, id: Math.max(...vehicules.map((v) => v.id)) + 1 }
  vehicules.push(newVehicule)
  return Promise.resolve(newVehicule)
}

export const updateVehicule = (id: number, updates: Partial<Vehicule>): Promise<Vehicule | null> => {
  const index = vehicules.findIndex((v) => v.id === id)
  if (index !== -1) {
    vehicules[index] = { ...vehicules[index], ...updates }
    return Promise.resolve(vehicules[index])
  }
  return Promise.resolve(null)
}

export const deleteVehicule = (id: number): Promise<boolean> => {
  const index = vehicules.findIndex((v) => v.id === id)
  if (index !== -1) {
    vehicules.splice(index, 1)
    return Promise.resolve(true)
  }
  return Promise.resolve(false)
}

// --- Clients -------------------------------------------------------------

export const getClients = (): Promise<Client[]> => {
  return Promise.resolve([...clients])
}

export const getClientById = (id: number): Promise<Client | null> => {
  const client = clients.find((c) => c.id === id)
  return Promise.resolve(client || null)
}

export const addClient = (client: Omit<Client, "id" | "pointsFidelite" | "dateInscription">): Promise<Client> => {
  const newClient = {
    ...client,
    id: Math.max(...clients.map((c) => c.id)) + 1,
    pointsFidelite: 0,
    dateInscription: new Date().toISOString().split("T")[0],
  }
  clients.push(newClient)
  return Promise.resolve(newClient)
}

export const updateClient = (id: number, updates: Partial<Client>): Promise<Client | null> => {
  const index = clients.findIndex((c) => c.id === id)
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updates }
    return Promise.resolve(clients[index])
  }
  return Promise.resolve(null)
}

// --- Employés ------------------------------------------------------------

export const getEmployes = (): Promise<Employe[]> => {
  return Promise.resolve([...employes])
}

export const getEmployeById = (id: number): Promise<Employe | null> => {
  const employe = employes.find((e) => e.id === id)
  return Promise.resolve(employe || null)
}

export const addEmploye = (employe: Omit<Employe, "id">): Promise<Employe> => {
  const newEmploye = {
    ...employe,
    id: Math.max(...employes.map((e) => e.id)) + 1,
  }
  employes.push(newEmploye)
  return Promise.resolve(newEmploye)
}

export const updateEmploye = (id: number, updates: Partial<Employe>): Promise<Employe | null> => {
  const index = employes.findIndex((e) => e.id === id)
  if (index !== -1) {
    employes[index] = { ...employes[index], ...updates }
    return Promise.resolve(employes[index])
  }
  return Promise.resolve(null)
}

export const deleteEmploye = (id: number): Promise<boolean> => {
  const index = employes.findIndex((e) => e.id === id)
  if (index !== -1) {
    employes.splice(index, 1)
    return Promise.resolve(true)
  }
  return Promise.resolve(false)
}

// --- Réservations --------------------------------------------------------

export const getReservations = (): Promise<Reservation[]> => {
  return Promise.resolve([...reservations])
}

export const getReservationsByClientId = (clientId: number): Promise<Reservation[]> => {
  const clientReservations = reservations.filter((r) => r.clientId === clientId)
  return Promise.resolve(clientReservations)
}

export const getReservationById = (id: number): Promise<Reservation | null> => {
  const reservation = reservations.find((r) => r.id === id)
  return Promise.resolve(reservation || null)
}

export const addReservation = (
  reservation: Omit<Reservation, "id" | "dateReservation" | "qrCode">,
): Promise<Reservation> => {
  const newReservation = {
    ...reservation,
    id: Math.max(...reservations.map((r) => r.id)) + 1,
    dateReservation: new Date().toISOString().split("T")[0],
    qrCode: `QR${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  }
  reservations.push(newReservation)
  return Promise.resolve(newReservation)
}

export const updateReservation = (id: number, updates: Partial<Reservation>): Promise<Reservation | null> => {
  const index = reservations.findIndex((r) => r.id === id)
  if (index !== -1) {
    reservations[index] = { ...reservations[index], ...updates }
    return Promise.resolve(reservations[index])
  }
  return Promise.resolve(null)
}

// --- Paiements -----------------------------------------------------------

export const getPaiements = (): Promise<Paiement[]> => {
  return Promise.resolve([...paiements])
}

export const getPaiementById = (id: number): Promise<Paiement | null> => {
  const paiement = paiements.find((p) => p.id === id)
  return Promise.resolve(paiement || null)
}

export const addPaiement = (paiement: Omit<Paiement, "id">): Promise<Paiement> => {
  const newPaiement = {
    ...paiement,
    id: Math.max(...paiements.map((p) => p.id)) + 1,
  }
  paiements.push(newPaiement)
  return Promise.resolve(newPaiement)
}

export const updatePaiement = (id: number, updates: Partial<Paiement>): Promise<Paiement | null> => {
  const index = paiements.findIndex((p) => p.id === id)
  if (index !== -1) {
    paiements[index] = { ...paiements[index], ...updates }
    return Promise.resolve(paiements[index])
  }
  return Promise.resolve(null)
}

// --- Avis ----------------------------------------------------------------

export const getAvis = (): Promise<Avis[]> => {
  return Promise.resolve([...avis])
}

export const getAvisByVehiculeId = (vehiculeId: number): Promise<Avis[]> => {
  const vehiculeAvis = avis.filter((a) => a.vehiculeId === vehiculeId)
  return Promise.resolve(vehiculeAvis)
}

export const addAvis = (nouvelAvis: Omit<Avis, "id" | "dateAvis">): Promise<Avis> => {
  const newAvis = {
    ...nouvelAvis,
    id: Math.max(...avis.map((a) => a.id)) + 1,
    dateAvis: new Date().toISOString().split("T")[0],
  }
  avis.push(newAvis)
  return Promise.resolve(newAvis)
}

// --- Utilisateurs --------------------------------------------------------

export const addUser = (user: Omit<User, "id">): Promise<User> => {
  const newUser = {
    ...user,
    id: Math.max(...users.map((u) => u.id)) + 1,
  }
  users.push(newUser)
  return Promise.resolve(newUser)
}

export const getUserById = (id: number): Promise<User | null> => {
  const user = users.find((u) => u.id === id)
  return Promise.resolve(user || null)
}

export const updateUser = (id: number, updates: Partial<User>): Promise<User | null> => {
  const index = users.findIndex((u) => u.id === id)
  if (index !== -1) {
    users[index] = { ...users[index], ...updates }
    return Promise.resolve(users[index])
  }
  return Promise.resolve(null)
}

// --- Authentification ----------------------------------------------------

export const login = (email: string, motDePasse: string): Promise<User | null> => {
  const user = users.find((u) => u.email === email && u.motDePasse === motDePasse)
  if (user) {
    if (typeof window !== "undefined") {
      localStorage.setItem("session", JSON.stringify(user))
    }
    return Promise.resolve(user)
  }
  return Promise.resolve(null)
}

export const logout = (): Promise<void> => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("session")
  }
  return Promise.resolve()
}

export const getCurrentUser = (): User | null => {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("session")
    return session ? JSON.parse(session) : null
  }
  return null
}

export const register = (
  email: string,
  motDePasse: string,
  clientData: Omit<Client, "id" | "pointsFidelite" | "dateInscription">,
): Promise<User | null> => {
  // Vérifier si l'email existe déjà
  const existingUser = users.find((u) => u.email === email)
  if (existingUser) {
    return Promise.resolve(null)
  }

  // Créer le client
  const newClient = {
    ...clientData,
    id: Math.max(...clients.map((c) => c.id)) + 1,
    pointsFidelite: 0,
    dateInscription: new Date().toISOString().split("T")[0],
  }
  clients.push(newClient)

  // Créer l'utilisateur
  const newUser = {
    id: Math.max(...users.map((u) => u.id)) + 1,
    email,
    role: "client" as const,
    motDePasse,
    clientId: newClient.id,
  }
  users.push(newUser)

  return Promise.resolve(newUser)
}

export interface Vehicule {
  id: number
  marque: string
  modele: string
  categorie: "economique" | "compacte" | "berline" | "suv" | "luxe"
  prixJournalier: number
  disponible: boolean
  carburant: "essence" | "diesel" | "electrique" | "hybride"
  transmission: "manuelle" | "automatique"
  places: number
  image: string
  description: string
  equipements: string[]
  kilometrage: number
  annee: number
}

export interface Client {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  dateNaissance: string
  numeroPermis: string
  adresse: string
  pointsFidelite: number
  dateInscription: string
}

export interface Reservation {
  id: number
  clientId: number
  vehiculeId: number
  dateDebut: string
  dateFin: string
  statut: "confirmee" | "en_cours" | "terminee" | "annulee"
  prixTotal: number
  options: {
    gps: boolean
    assuranceComplete: boolean
    siegeEnfant: boolean
    conducteurSupplementaire: boolean
  }
  dateReservation: string
  qrCode: string
}

export interface Employe {
  id: number
  nom: string
  prenom: string
  email: string
  role: "admin" | "employe"
  agenceId: number
  dateEmbauche: string
}

export interface Paiement {
  id: number
  reservationId: number
  montant: number
  statut: "en_attente" | "paye" | "rembourse"
  methodePaiement: "carte" | "especes" | "virement"
  datePaiement: string
}

export interface Avis {
  id: number
  clientId: number
  vehiculeId: number
  note: number
  commentaire: string
  dateAvis: string
}

export interface User {
  id: number
  email: string
  role: "client" | "admin" | "employe"
  motDePasse: string
  clientId?: number
  employeId?: number
}

export interface Agence {
  id: number
  nom: string
  adresse: string
  telephone: string
  email: string
  heuresOuverture: string
}

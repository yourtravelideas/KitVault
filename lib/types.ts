export type ShirtType = "Home" | "Away" | "Third" | "Goalkeeper" | "Training" | "Special"
export type AuthenticityType = "Replica" | "Player Issue" | "Match Worn" | "Unknown"
export type ShirtStatus = "owned" | "open_to_trade" | "not_for_sale"
export type WishlistPriority = "Low" | "Medium" | "High" | "Grail"
export type WishlistStatus = "Searching" | "Found" | "Paused"

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  cover_image_url: string | null
  created_at: string
  updated_at: string
  shirt_count?: number
}

export interface Shirt {
  id: string
  collection_id: string
  user_id: string
  title: string
  club: string
  country: string | null
  season: string | null
  shirt_type: ShirtType
  manufacturer: string | null
  sponsor: string | null
  size: string | null
  player_name: string | null
  shirt_number: string | null
  condition: string | null
  authenticity_type: AuthenticityType
  signed: boolean
  patches: string | null
  purchase_source: string | null
  purchase_date: string | null
  purchase_price: number | null
  estimated_value: number | null
  currency: string
  notes: string | null
  status: ShirtStatus
  images: ShirtImage[]
  created_at: string
  updated_at: string
}

export interface ShirtImage {
  id: string
  shirt_id: string
  url: string
  storage_path: string | null
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface WishlistItem {
  id: string
  user_id: string
  club: string
  season: string | null
  shirt_type: ShirtType | null
  size: string | null
  player_name: string | null
  priority: WishlistPriority
  notes: string | null
  status: WishlistStatus
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  created_at: string
  updated_at: string
}

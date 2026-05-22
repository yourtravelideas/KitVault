// Supabase database types.
//
// This file mirrors the output of:
//   npx supabase gen types typescript --project-id <your-project-id> > lib/database.types.ts
//
// It is hand-maintained here because no live Supabase project is linked in this
// environment. Once you link a project, regenerate it with the command above so
// the types stay in sync with the database schema.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          cover_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      shirts: {
        Row: {
          id: string
          collection_id: string
          user_id: string
          title: string
          club: string
          country: string | null
          season: string | null
          shirt_type: string
          manufacturer: string | null
          sponsor: string | null
          size: string | null
          player_name: string | null
          shirt_number: string | null
          condition: string | null
          authenticity_type: string
          signed: boolean
          patches: string | null
          purchase_source: string | null
          purchase_date: string | null
          purchase_price: number | null
          estimated_value: number | null
          currency: string
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          user_id: string
          title: string
          club: string
          country?: string | null
          season?: string | null
          shirt_type?: string
          manufacturer?: string | null
          sponsor?: string | null
          size?: string | null
          player_name?: string | null
          shirt_number?: string | null
          condition?: string | null
          authenticity_type?: string
          signed?: boolean
          patches?: string | null
          purchase_source?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          estimated_value?: number | null
          currency?: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          user_id?: string
          title?: string
          club?: string
          country?: string | null
          season?: string | null
          shirt_type?: string
          manufacturer?: string | null
          sponsor?: string | null
          size?: string | null
          player_name?: string | null
          shirt_number?: string | null
          condition?: string | null
          authenticity_type?: string
          signed?: boolean
          patches?: string | null
          purchase_source?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          estimated_value?: number | null
          currency?: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shirts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          }
        ]
      }
      shirt_images: {
        Row: {
          id: string
          shirt_id: string
          url: string
          storage_path: string | null
          is_primary: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          shirt_id: string
          url: string
          storage_path?: string | null
          is_primary?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          shirt_id?: string
          url?: string
          storage_path?: string | null
          is_primary?: boolean
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shirt_images_shirt_id_fkey"
            columns: ["shirt_id"]
            isOneToOne: false
            referencedRelation: "shirts"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          club: string
          season: string | null
          shirt_type: string | null
          size: string | null
          player_name: string | null
          priority: string
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          club: string
          season?: string | null
          shirt_type?: string | null
          size?: string | null
          player_name?: string | null
          priority?: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          club?: string
          season?: string | null
          shirt_type?: string | null
          size?: string | null
          player_name?: string | null
          priority?: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]

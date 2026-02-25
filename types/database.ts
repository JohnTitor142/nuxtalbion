export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'shotcaller' | 'user'
export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed'

export interface Database {
  public: {
    Tables: {
      users_profiles: {
        Row: {
          id: string
          username: string
          pin: string
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          pin: string
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          pin?: string
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      weapons: {
        Row: {
          id: string
          api_id: number | null
          name: string
          tier: string
          item_power: number | null
          identifier: string
          icon_url: string | null
          category_name: string | null
          subcategory_name: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          api_id?: number | null
          name: string
          tier: string
          item_power?: number | null
          identifier: string
          icon_url?: string | null
          category_name?: string | null
          subcategory_name?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          api_id?: number | null
          name?: string
          tier?: string
          item_power?: number | null
          identifier?: string
          icon_url?: string | null
          category_name?: string | null
          subcategory_name?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      armors: {
        Row: {
          id: string
          api_id: number | null
          name: string
          tier: string
          item_power: number | null
          identifier: string
          icon_url: string | null
          category_name: string | null
          subcategory_name: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          api_id?: number | null
          name: string
          tier: string
          item_power?: number | null
          identifier: string
          icon_url?: string | null
          category_name?: string | null
          subcategory_name?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          api_id?: number | null
          name?: string
          tier?: string
          item_power?: number | null
          identifier?: string
          icon_url?: string | null
          category_name?: string | null
          subcategory_name?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      accessories: {
        Row: {
          id: string
          api_id: number | null
          name: string
          tier: string
          item_power: number | null
          identifier: string
          icon_url: string | null
          category_name: string | null
          subcategory_name: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          api_id?: number | null
          name: string
          tier: string
          item_power?: number | null
          identifier: string
          icon_url?: string | null
          category_name?: string | null
          subcategory_name?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          api_id?: number | null
          name?: string
          tier?: string
          item_power?: number | null
          identifier?: string
          icon_url?: string | null
          category_name?: string | null
          subcategory_name?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      consumables: {
        Row: {
          id: string
          api_id: number | null
          name: string
          tier: string
          item_power: number | null
          identifier: string
          icon_url: string | null
          info: string | null
          category_name: string | null
          subcategory_name: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          api_id?: number | null
          name: string
          tier: string
          item_power?: number | null
          identifier: string
          icon_url?: string | null
          info?: string | null
          category_name?: string | null
          subcategory_name?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          api_id?: number | null
          name?: string
          tier?: string
          item_power?: number | null
          identifier?: string
          icon_url?: string | null
          info?: string | null
          category_name?: string | null
          subcategory_name?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      compositions: {
        Row: {
          id: string
          name: string
          description: string | null
          total_groups: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          total_groups: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          total_groups?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      composition_slots: {
        Row: {
          id: string
          composition_id: string
          group_number: number
          weapon_id: string | null
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          composition_id: string
          group_number: number
          weapon_id?: string | null
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          composition_id?: string
          group_number?: number
          weapon_id?: string | null
          quantity?: number
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          name: string
          description: string | null
          composition_id: string | null
          scheduled_at: string
          status: ActivityStatus
          roaster_locked: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          composition_id?: string | null
          scheduled_at: string
          status?: ActivityStatus
          roaster_locked?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          composition_id?: string | null
          scheduled_at?: string
          status?: ActivityStatus
          roaster_locked?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_registrations: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          weapon1_id: string
          weapon2_id: string | null
          weapon3_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          user_id: string
          weapon1_id: string
          weapon2_id?: string | null
          weapon3_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          user_id?: string
          weapon1_id?: string
          weapon2_id?: string | null
          weapon3_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roasters: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          weapon_id: string
          group_number: number
          slot_position: number
          assigned_by: string
          assigned_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          user_id: string
          weapon_id: string
          group_number: number
          slot_position: number
          assigned_by: string
          assigned_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          user_id?: string
          weapon_id?: string
          group_number?: number
          slot_position?: number
          assigned_by?: string
          assigned_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      user_role: {
        admin: 'admin';
        shotcaller: 'shotcaller';
        user: 'user'
      };
      activity_status: {
        upcoming: 'upcoming';
        ongoing: 'ongoing';
        completed: 'completed'
      }
    }
  }
}

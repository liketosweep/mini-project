export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RoomStatus = 'recruiting' | 'active' | 'completed' | 'cancelled'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          virtual_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          virtual_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          virtual_points?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          is_archived: boolean
          current_streak: number
          longest_streak: number
          last_completed_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string
          is_archived?: boolean
          current_streak?: number
          longest_streak?: number
          last_completed_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          is_archived?: boolean
          current_streak?: number
          longest_streak?: number
          last_completed_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          check_in_date: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          check_in_date: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          check_in_date?: string
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          id: string
          creator_id: string
          name: string
          description: string | null
          habit_title: string
          invite_code: string
          entry_points: number
          points_pool: number
          acceptance_deadline: string
          start_date: string
          end_date: string
          status: RoomStatus
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          name: string
          description?: string | null
          habit_title: string
          invite_code: string
          entry_points?: number
          points_pool?: number
          acceptance_deadline: string
          start_date: string
          end_date: string
          status?: RoomStatus
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          description?: string | null
          habit_title?: string
          invite_code?: string
          entry_points?: number
          points_pool?: number
          acceptance_deadline?: string
          start_date?: string
          end_date?: string
          status?: RoomStatus
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          points: number
          final_rank: number | null
          payout_received: number
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          points?: number
          final_rank?: number | null
          payout_received?: number
          joined_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          points?: number
          final_rank?: number | null
          payout_received?: number
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      room_logs: {
        Row: {
          id: string
          room_id: string
          user_id: string
          check_in_date: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          check_in_date: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          check_in_date?: string
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_logs_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_challenge_room: {
        Args: {
          p_name: string
          p_description: string | null
          p_habit_title: string
          p_invite_code: string
          p_entry_points: number
          p_acceptance_deadline: string
          p_start_date: string
          p_end_date: string
        }
        Returns: string
      }
      join_challenge_room: {
        Args: {
          p_invite_code: string
        }
        Returns: string
      }
      get_room_preview_by_invite: {
        Args: {
          p_invite_code: string
        }
        Returns: {
          room_id: string
          name: string
          description: string | null
          habit_title: string
          entry_points: number
          acceptance_deadline: string
          start_date: string
          end_date: string
          participant_count: number
          is_deadline_passed: boolean
        }[]
      }
      check_in_solo_habit: {
        Args: {
          p_habit_id: string
          p_check_in_date: string
          p_note?: string | null
        }
        Returns: Json
      }
      check_in_room: {
        Args: {
          p_room_id: string
          p_check_in_date: string
          p_note?: string | null
        }
        Returns: Json
      }
      finalize_room_standings: {
        Args: {
          p_room_id: string
        }
        Returns: void
      }
    }
    Enums: {
      room_status: RoomStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitLog = Database['public']['Tables']['habit_logs']['Row']
export type Room = Database['public']['Tables']['rooms']['Row']
export type RoomParticipant = Database['public']['Tables']['room_participants']['Row']
export type RoomLog = Database['public']['Tables']['room_logs']['Row']
export type RoomPreview = Database['public']['Functions']['get_room_preview_by_invite']['Returns'][number]

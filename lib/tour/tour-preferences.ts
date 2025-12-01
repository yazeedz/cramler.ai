import { createClient } from '@/app/utils/supabase/client'

export interface TourPreferences {
  newPage?: boolean
  deckPage?: boolean
  managePage?: boolean
  shopPage?: boolean
  // Add more tour types as needed
}

export class TourPreferencesManager {
  private supabase = createClient()

  async getTourPreferences(userId: string): Promise<TourPreferences> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('tour_completed')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, return default
          return {}
        }
        throw error
      }

      return data?.tour_completed || {}
    } catch (error) {
      console.error('Failed to get tour preferences:', error)
      return {} // Default: no tours completed
    }
  }

  async markTourCompleted(userId: string, tourType: keyof TourPreferences): Promise<void> {
    try {
      const currentPrefs = await this.getTourPreferences(userId)
      const updatedPrefs = { ...currentPrefs, [tourType]: true }

      const { error } = await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          tour_completed: updatedPrefs,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to mark tour completed:', error)
      throw error
    }
  }

  async shouldShowTour(userId: string, tourType: keyof TourPreferences): Promise<boolean> {
    try {
      const preferences = await this.getTourPreferences(userId)
      return !preferences[tourType] // Show if not completed
    } catch (error) {
      console.error('Failed to check if should show tour:', error)
      return false // Don't show tour on error
    }
  }

  async resetTour(userId: string, tourType: keyof TourPreferences): Promise<void> {
    try {
      const currentPrefs = await this.getTourPreferences(userId)
      const updatedPrefs = { ...currentPrefs, [tourType]: false }

      const { error } = await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          tour_completed: updatedPrefs,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to reset tour:', error)
      throw error
    }
  }

  async resetAllTours(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          tour_completed: {},
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to reset all tours:', error)
      throw error
    }
  }
}

export const tourPreferences = new TourPreferencesManager() 
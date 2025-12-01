// lib/package-changes/processor.ts
// Processor for applying package changes to IndexedDB and Supabase

import { createClient } from '@/app/utils/supabase/client'
import { packagesLocalStore } from '@/lib/storage/indexeddb/stores/packages-local'
import type { PackageChange, PackageChanges } from './types'
import type { PackagesLocalStore } from '@/lib/storage/indexeddb/schema'

export interface ProcessResult {
  success: boolean
  error?: string
  appliedChanges: string[] // IDs of successfully applied changes
  failedChanges: string[] // IDs of failed changes
}

export class PackageChangesProcessor {
  private supabase = createClient()

  /**
   * Process all changes and apply them to IndexedDB and Supabase
   */
  async processChanges(
    changes: PackageChanges,
    packageId: string,
    userId: string
  ): Promise<ProcessResult> {
    const appliedChanges: string[] = []
    const failedChanges: string[] = []

    console.log('🔄 PackageChangesProcessor: Processing', Object.keys(changes).length, 'changes...')

    try {
      // Get current package data from IndexedDB
      const currentPackage = await packagesLocalStore.getPackage(userId, packageId)
      if (!currentPackage) {
        throw new Error('Package not found in IndexedDB')
      }

      // Prepare updates
      const updates: Partial<PackagesLocalStore> = {}

      // Apply all changes to the update object
      for (const [id, change] of Object.entries(changes)) {
        try {
          if (change.type === 'package_name') {
            updates.name = change.value
            appliedChanges.push(id)
          } else if (change.type === 'package_description') {
            updates.description = change.value
            appliedChanges.push(id)
          }
        } catch (error) {
          console.error(`Failed to process change ${id}:`, error)
          failedChanges.push(id)
        }
      }

      if (Object.keys(updates).length === 0) {
        console.log('ℹ️ No changes to apply')
        return { success: true, appliedChanges: [], failedChanges: [] }
      }

      // Update IndexedDB
      const updatedPackage = { ...currentPackage, ...updates }
      await packagesLocalStore.saveCompletePackage(updatedPackage)
      console.log('✅ Updated package in IndexedDB')

      // Update Supabase
      const { error: supabaseError } = await this.supabase
        .from('packages')
        .update(updates)
        .eq('id', packageId)

      if (supabaseError) {
        console.error('❌ Supabase update failed:', supabaseError)
        throw supabaseError
      }

      console.log('✅ Updated package in Supabase')
      console.log('✅ PackageChangesProcessor: Applied', appliedChanges.length, 'changes successfully')

      return {
        success: failedChanges.length === 0,
        appliedChanges,
        failedChanges
      }
    } catch (error) {
      console.error('❌ PackageChangesProcessor: Fatal error processing changes:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        appliedChanges,
        failedChanges: Object.keys(changes)
      }
    }
  }
}

// Export singleton instance
export const packageChangesProcessor = new PackageChangesProcessor()

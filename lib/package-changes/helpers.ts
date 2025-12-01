// lib/package-changes/helpers.ts
// Helper functions for managing package changes

import type { PackageChange, PackageChanges } from './types'
import { generateChangeId } from './types'

/**
 * Add a change to the changes dictionary
 */
export function addChange(
  changes: PackageChanges,
  change: PackageChange
): PackageChanges {
  const changeId = generateChangeId(change)
  return {
    ...changes,
    [changeId]: change
  }
}

/**
 * Remove a change from the changes dictionary by ID
 */
export function removeChange(
  changes: PackageChanges,
  changeId: string
): PackageChanges {
  const { [changeId]: removed, ...rest } = changes
  return rest
}

/**
 * Check if changes dictionary has any changes
 */
export function hasAnyChanges(changes: PackageChanges): boolean {
  return Object.keys(changes).length > 0
}

/**
 * Get total number of changes
 */
export function getChangeCount(changes: PackageChanges): number {
  return Object.keys(changes).length
}

/**
 * Clear all changes
 */
export function clearChanges(): PackageChanges {
  return {}
}

/**
 * Get a human-readable summary of changes
 */
export function getChangesSummary(changes: PackageChanges): string {
  const count = getChangeCount(changes)
  if (count === 0) return 'No changes'

  const types = Object.values(changes).map(c => c.type)
  const hasName = types.includes('package_name')
  const hasDescription = types.includes('package_description')

  const parts: string[] = []
  if (hasName) parts.push('name')
  if (hasDescription) parts.push('description')

  return `${count} change${count === 1 ? '' : 's'}: ${parts.join(', ')}`
}

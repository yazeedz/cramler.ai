// lib/package-changes/types.ts
// Simple type system for tracking package changes

/**
 * Question draft data for update-question-in-package edge function
 */
export interface QuestionChangeData {
  questionId: string
  content: string // Raw markdown content
  language?: string
  options: Array<{
    optionId?: string
    content: string // Raw markdown content
    isCorrect: boolean
    order: number
  }>
  tags: string[]
  tables?: Array<{
    id: string // Can be draft_table_* or real UUID
    content: {
      headers?: string[]
      rows: Record<string, string>[]
    }
  }>
  images?: Array<{
    id: string // Can be draft_image_* or real UUID
    file?: {
      name: string
      type: string
      data: string // base64
    }
  }>
}

/**
 * New question data for add-question-to-package edge function
 */
export interface NewQuestionData {
  draftId: string // Temporary ID for tracking (e.g., draft_question_123)
  content: string // Raw markdown content
  language?: string
  options: Array<{
    content: string // Raw markdown content
    is_correct: boolean
    order: number
  }>
  tags?: string[]
  tables?: Array<{
    id: string // draft_table_* ID
    content: {
      headers?: string[]
      rows: Record<string, string>[]
    }
  }>
  images?: Array<{
    id: string // draft_image_* ID
    file: {
      name: string
      type: string
      data: string // base64
    }
  }>
}

/**
 * Package change types
 */
export type PackageChange =
  | {
      type: 'package_name'
      value: string
    }
  | {
      type: 'package_description'
      value: string
    }
  | {
      type: 'question_update'
      value: QuestionChangeData
    }
  | {
      type: 'question_add'
      value: NewQuestionData
    }

/**
 * Changes dictionary keyed by unique change ID
 */
export interface PackageChanges {
  [changeId: string]: PackageChange
}

/**
 * Generate unique change ID for a change
 */
export function generateChangeId(change: PackageChange): string {
  if (change.type === 'question_update') {
    return `question_${change.value.questionId}`
  }
  if (change.type === 'question_add') {
    return `question_${change.value.draftId}`
  }
  return change.type
}

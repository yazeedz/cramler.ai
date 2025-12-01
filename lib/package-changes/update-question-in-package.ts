/**
 * Module for updating a question in a package
 * Handles the complete flow: Edge function call → IndexedDB updates → Context refresh
 */

import { createClient } from '@/app/utils/supabase/client'
import { questionsStore } from '@/lib/storage/indexeddb/stores/questions'
import { questionTablesSync } from '@/lib/storage/cache/sync-modules/question-tables-sync'
import { imagesSync } from '@/lib/storage/cache/sync-modules/images-sync'
import { packagesLocalStore } from '@/lib/storage/indexeddb/stores/packages-local'
import type { QuestionChangeData } from './types'

interface UpdateQuestionParams {
  userId: string
  packageId: string
  questionId: string
  changes: QuestionChangeData
}

interface UpdateQuestionResult {
  success: boolean
  updatedQuestion: any
  error?: string
}

/**
 * Update a question in a package
 * 1. Calls the edge function with the changes
 * 2. Updates IndexedDB with the response data
 * 3. Returns the updated question data
 */
export async function updateQuestionInPackage({
  userId,
  packageId,
  questionId,
  changes
}: UpdateQuestionParams): Promise<UpdateQuestionResult> {
  try {
    console.log(`🔄 Updating question ${questionId} in package ${packageId}...`)

    const supabase = createClient()

    // Convert options from camelCase to snake_case for edge function
    const optionsForEdgeFunction = (changes.options || []).map((opt: any) => ({
      option_id: opt.optionId,
      content: opt.content,
      is_correct: opt.isCorrect,
      order: opt.order
    }))

    // Prepare request body for edge function
    const requestBody = {
      user_id: userId,
      question_id: questionId,
      package_id: packageId,
      content: changes.content,
      language: changes.language,
      options: optionsForEdgeFunction,
      tags: changes.tags || [],
      tables: changes.tables || [],
      images: changes.images || []
    }

    console.log(`🚀 Calling edge function with:`, {
      questionId,
      contentLength: requestBody.content?.length,
      optionsCount: requestBody.options?.length,
      tagsCount: requestBody.tags?.length,
      tablesCount: requestBody.tables?.length,
      imagesCount: requestBody.images?.length
    })
    console.log(`📊 REQUEST BODY TABLES:`, requestBody.tables)

    // Call the edge function
    const { data: result, error: functionError } = await supabase.functions.invoke('update-question-in-package', {
      body: requestBody
    })

    if (functionError) {
      console.error(`❌ Edge function error:`, functionError)
      throw new Error(functionError.message || 'Failed to update question')
    }

    if (!result || result.error) {
      throw new Error(result?.error || 'Failed to update question')
    }

    console.log(`✅ Edge function returned:`, result)
    console.log(`📊 RESULT TABLES:`, result.tables)

    // Get existing question from IndexedDB to preserve fields not returned by edge function
    const existingQuestion = await questionsStore.getQuestion(questionId)
    if (!existingQuestion) {
      console.error(`❌ Question ${questionId} not found in IndexedDB`)
      throw new Error(`Question ${questionId} not found in IndexedDB`)
    }

    // Update question in IndexedDB with the returned data
    const updatedQuestionData = {
      ...existingQuestion,
      id: result.question.id,
      questionId: result.question.id,
      content: result.question.content,
      language: result.question.language,
      options: result.question.options.map((opt: any) => ({
        optionId: opt.id,
        content: opt.content,
        isCorrect: opt.is_correct,
        order: opt.order
      })),
      tags: result.question.tags || [],
      explanations: existingQuestion.explanations || [],
      updatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString()
    }

    await questionsStore.saveQuestion(updatedQuestionData)
    console.log(`✅ Question ${questionId} updated in IndexedDB`)

    // Update tables in IndexedDB using the sync module
    // Always sync from Supabase to ensure we have the latest data
    console.log(`🔄 Syncing tables from Supabase for question ${questionId}...`)
    try {
      await questionTablesSync.syncTablesByQuestionId(questionId, packageId)
      console.log(`✅ Tables synced successfully for question ${questionId}`)
    } catch (error) {
      console.error('❌ Error syncing tables:', error)
      // Don't throw - allow the question update to succeed even if table sync fails
    }

    // Update images in IndexedDB from edge function response
    if (result.images && Array.isArray(result.images)) {
      console.log(`🖼️ Processing ${result.images.length} images from edge function response...`)
      for (const image of result.images) {
        try {
          // Sync each image - this will cache metadata and public URL
          await imagesSync.loadImage(image.id)
          console.log(`✅ Synced image ${image.id}`)
        } catch (error) {
          console.error(`❌ Error syncing image ${image.id}:`, error)
          // Continue with other images even if one fails
        }
      }
    }

    // Update tags in packages_local store
    if (result.question.tags) {
      const packageData = await packagesLocalStore.getPackage(userId, packageId)
      if (packageData) {
        // Update question_data with new tags
        const updatedPackageQuestionData = {
          ...packageData.question_data,
          [questionId]: {
            ...packageData.question_data[questionId],
            tags: result.question.tags
          }
        }

        // Save updated package data back to IndexedDB
        await packagesLocalStore.saveCompletePackage({
          ...packageData,
          question_data: updatedPackageQuestionData,
          lastSyncedAt: new Date().toISOString()
        })

        console.log(`✅ Question tags updated in packages_local for ${questionId}`)
      }
    }

    // Dispatch event to notify contexts to refresh
    window.dispatchEvent(new CustomEvent('question-updated', {
      detail: { questionId, updatedData: updatedQuestionData }
    }))

    console.log(`✅ Question ${questionId} update complete!`)

    return {
      success: true,
      updatedQuestion: updatedQuestionData
    }

  } catch (error) {
    console.error(`❌ Failed to update question ${questionId}:`, error)
    return {
      success: false,
      updatedQuestion: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

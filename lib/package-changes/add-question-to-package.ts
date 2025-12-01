// lib/package-changes/add-question-to-package.ts
// Module for adding new questions to a package

import { createClient } from '@/app/utils/supabase/client'
import { questionsStore } from '@/lib/storage/indexeddb/stores/questions'
import { questionTablesSync } from '@/lib/storage/cache/sync-modules/question-tables-sync'
import { imagesSync } from '@/lib/storage/cache/sync-modules/images-sync'
import type { NewQuestionData } from './types'

interface AddQuestionParams {
  userId: string
  packageId: string
  questionData: NewQuestionData
}

interface AddQuestionResult {
  success: boolean
  questionId?: string
  error?: string
}

/**
 * Add a new question to a package
 * Calls the add-question-to-package edge function and syncs the result to IndexedDB
 */
export async function addQuestionToPackage({
  userId,
  packageId,
  questionData
}: AddQuestionParams): Promise<AddQuestionResult> {
  const supabase = createClient()

  try {
    console.log('📝 Adding new question to package:', { userId, packageId, draftId: questionData.draftId })

    // Validate question data before sending
    if (!questionData.content || questionData.content.trim().length === 0) {
      return {
        success: false,
        error: 'Question content cannot be empty'
      }
    }

    if (!questionData.options || questionData.options.length < 2) {
      return {
        success: false,
        error: 'Question must have at least 2 options'
      }
    }

    // Validate that all options have content
    for (let i = 0; i < questionData.options.length; i++) {
      const option = questionData.options[i]
      if (!option.content || option.content.trim().length === 0) {
        return {
          success: false,
          error: `Option ${i + 1} cannot be empty`
        }
      }
    }

    // Call the add-question-to-package edge function
    const requestBody = {
      user_id: userId,
      package_id: packageId,
      content: questionData.content,
      language: questionData.language || 'en',
      options: questionData.options,
      tags: questionData.tags || [],
      tables: questionData.tables || [],
      images: questionData.images || []
    }

    console.log('📤 Calling add-question-to-package edge function...')
    const { data: result, error: edgeFunctionError } = await supabase.functions.invoke(
      'add-question-to-package',
      {
        body: requestBody
      }
    )

    if (edgeFunctionError) {
      console.error('❌ Edge function error:', edgeFunctionError)
      return {
        success: false,
        error: `Failed to add question: ${edgeFunctionError.message}`
      }
    }

    if (!result || !result.question || !result.question.id) {
      console.error('❌ Invalid response from edge function:', result)
      return {
        success: false,
        error: 'Invalid response from server'
      }
    }

    const questionId = result.question.id
    const updatedContent = result.question.content
    const updatedOptions = result.question.options

    console.log('✅ Question created successfully:', {
      questionId,
      tableIds: result.table_ids,
      imageIds: result.image_ids
    })

    // Save the question to IndexedDB
    const questionToSave = {
      questionId,
      packageId,
      content: updatedContent,
      language: questionData.language || 'en',
      options: updatedOptions.map((opt: any) => ({
        optionId: opt.id || `option_${Date.now()}_${Math.random()}`,
        content: opt.content,
        isCorrect: opt.is_correct,
        order: opt.order
      })),
      explanations: [],
      tags: questionData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    }

    await questionsStore.saveQuestion(questionToSave)
    console.log('✅ Question saved to IndexedDB questions table')

    // Update packages_local to include the new question
    const { packagesLocalStore } = await import('@/lib/storage/indexeddb/stores/packages-local')
    const { userInfoStore } = await import('@/lib/storage/indexeddb/stores/user-info')

    const userInfo = await userInfoStore.getUserInfo()
    if (userInfo) {
      const packageData = await packagesLocalStore.getPackage(userInfo.userId, packageId)
      if (packageData) {
        // Add the new question to question_data
        const updatedQuestionData = {
          ...packageData.question_data,
          [questionId]: {
            tags: questionData.tags || [],
            collection_id: ''
          }
        }

        // Update the package
        await packagesLocalStore.saveCompletePackage({
          ...packageData,
          question_data: updatedQuestionData
        })

        console.log('✅ Question added to packages_local')
      }
    }

    // Sync tables if any were created
    if (result.table_ids && result.table_ids.length > 0) {
      console.log('📊 Syncing tables:', result.table_ids)
      await questionTablesSync.syncTablesByQuestionId(questionId, packageId)
    }

    // Sync images if any were created
    if (result.image_ids && result.image_ids.length > 0) {
      console.log('🖼️ Syncing images:', result.image_ids)
      for (const imageId of result.image_ids) {
        await imagesSync.loadImage(imageId)
      }
    }

    // Dispatch event to notify other contexts
    window.dispatchEvent(new CustomEvent('question-added', {
      detail: {
        questionId,
        packageId,
        questionData: questionToSave
      }
    }))

    console.log('✅ Question added successfully')

    return {
      success: true,
      questionId
    }

  } catch (error) {
    console.error('❌ Error adding question:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

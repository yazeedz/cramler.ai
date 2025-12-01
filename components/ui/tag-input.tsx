"use client"

import React, { useState, useRef, KeyboardEvent } from "react"
import { X, Plus, Tag as TagIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TagInputProps {
  tags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  placeholder?: string
}

/**
 * Validates if a tag follows the required hierarchical format:
 * - Must contain only alphanumeric characters, slashes, and underscores
 * - Must have at least one slash (to create hierarchy)
 * - Cannot have consecutive slashes
 * - Cannot start or end with a slash
 */
export function isValidTag(tag: string): boolean {
  // Basic format validation (alphanumeric, slashes, underscores only)
  if (!/^[a-zA-Z0-9_/]+$/.test(tag)) {
    return false
  }
  
  // Must contain at least one slash
  if (!tag.includes('/')) {
    return false
  }
  
  // Can't have consecutive slashes
  if (tag.includes('//')) {
    return false
  }
  
  // Can't start or end with a slash
  if (tag.startsWith('/') || tag.endsWith('/')) {
    return false
  }
  
  return true
}

export function TagInput({
  tags,
  onAddTag,
  onRemoveTag,
  placeholder = "Add tag (format: category/subcategory)..."
}: TagInputProps) {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    
    // Clear error when typing
    if (error) {
      setError(null)
    }
  }

  const addTag = () => {
    if (!input.trim()) return
    
    const tag = input.trim().toLowerCase()
    
    // Check if tag is valid format
    if (!isValidTag(tag)) {
      setError("Tag format invalid. Use format: category/subcategory")
      return
    }
    
    // Check if tag already exists
    if (tags.includes(tag)) {
      setError("Tag already exists")
      return
    }
    
    onAddTag(tag)
    setInput("")
    setError(null)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex">
        <Input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={addTag}
          className="ml-2"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add tag</span>
        </Button>
      </div>
      
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            <TagIcon className="h-3 w-3" />
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemoveTag(tag)}
              className="h-4 w-4 p-0 ml-1 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove tag</span>
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  )
} 
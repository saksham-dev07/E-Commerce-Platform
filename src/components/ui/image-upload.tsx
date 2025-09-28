'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Camera } from 'lucide-react'
import { Button } from './button'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  onError: (error: string) => void
  currentImage?: string
  onClearImage?: () => void
}

export function ImageUpload({ onImageUploaded, onError, currentImage, onClearImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string>(currentImage || '')

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      onError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      onError('File too large. Maximum size is 5MB.')
      return
    }

    setIsUploading(true)
    onError('') // Clear any previous errors

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        onImageUploaded(data.imageUrl)
      } else {
        const errorData = await response.json()
        onError(errorData.error || 'Failed to upload image')
        setPreview('')
      }
    } catch (err) {
      onError('An error occurred while uploading the image')
      setPreview('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleClear = () => {
    setPreview('')
    if (onClearImage) {
      onClearImage()
    }
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : preview
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <X className="w-4 h-4" />
            </Button>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <Camera className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-lg font-medium text-gray-700">
                {isDragging ? 'Drop image here' : 'Upload product image'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop an image, or click to browse
              </p>
            </div>

            <div className="flex justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload-input"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload-input"
                className="cursor-pointer inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Choose File'}
              </label>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Supported formats: JPEG, PNG, GIF, WebP • Maximum size: 5MB
      </p>
    </div>
  )
}

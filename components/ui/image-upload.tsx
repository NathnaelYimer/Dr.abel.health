'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export function ImageUpload({
  value,
  onChange,
  disabled,
  className,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = 'image/*',
}: {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  maxSize?: number
  accept?: string
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Validate file size
      if (file.size > maxSize) {
        setError(`File is too large. Max size: ${maxSize / 1024 / 1024}MB`)
        return
      }

      setError(null)
      setIsUploading(true)

      try {
        // Create form data
        const formData = new FormData()
        formData.append('file', file)

        // Upload file to API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        onChange(data.url)
      } catch (err) {
        console.error('Upload error:', err)
        setError('Failed to upload image. Please try again.')
      } finally {
        setIsUploading(false)
      }
    },
    [maxSize, onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxFiles: 1,
    disabled: disabled || isUploading,
  })

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        <div className="relative group">
          <div className="relative rounded-md overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={removeImage}
              disabled={disabled || isUploading}
            >
              <Icons.trash className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Click to change or drag and drop a new image
          </p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <Icons.loader className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <Icons.upload className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-sm text-muted-foreground">
              {isUploading ? (
                'Uploading...'
              ) : isDragActive ? (
                'Drop the image here'
              ) : (
                <>
                  <span className="font-medium text-foreground">Click to upload</span> or drag and drop
                  <br />
                  <span className="text-xs">PNG, JPG, GIF up to {maxSize / 1024 / 1024}MB</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

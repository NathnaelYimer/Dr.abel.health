"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, X, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  disabled = false, 
  className = "" 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/upload", true)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const { url } = JSON.parse(xhr.responseText)
          onChange(url)
        } else {
          console.error("Upload failed")
        }
        setUploading(false)
      }

      xhr.onerror = () => {
        console.error("Upload error")
        setUploading(false)
      }

      xhr.send(formData)
    } catch (error) {
      console.error("Upload error:", error)
      setUploading(false)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    disabled: disabled || uploading,
    multiple: false,
  })

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        {value ? (
          <div className="relative">
            <img 
              src={value} 
              alt="Preview" 
              className="max-h-64 mx-auto rounded-md"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="py-8">
            {uploading ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p>Uploading... {progress}%</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">
                  {isDragActive ? "Drop image here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </>
            )}
          </div>
        )}
      </div>
      {uploading && <Progress value={progress} className="mt-2" />}
    </div>
  )
}

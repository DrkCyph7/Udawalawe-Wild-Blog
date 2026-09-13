'use client'

import { useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  images: File[];
  onChange: (images: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function ImageUpload({ images, onChange, maxFiles = 5, maxSizeMB = 5 }: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (!e.target.files) return

    const selectedFiles = Array.from(e.target.files)
    
    // Check max files
    if (images.length + selectedFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} images.`)
      return
    }

    // Check sizes and types
    const validFiles: File[] = []
    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.')
        return
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Image ${file.name} exceeds the maximum size of ${maxSizeMB}MB.`)
        return
      }
      validFiles.push(file)
    }

    onChange([...images, ...validFiles])
  }, [images, maxFiles, maxSizeMB, onChange])

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 mb-4">
        {images.map((file, index) => (
          <div key={`${file.name}-${index}`} className="relative w-24 h-24 sm:w-32 sm:h-32 group">
            <img 
              src={URL.createObjectURL(file)} 
              alt={`preview ${index}`} 
              className="object-cover w-full h-full rounded-md border"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {images.length < maxFiles && (
          <label className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <Upload size={24} className="text-zinc-400 mb-2" />
            <span className="text-xs text-zinc-500 text-center px-2">Add Image</span>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-zinc-500">Max {maxFiles} images, {maxSizeMB}MB each.</p>
    </div>
  )
}

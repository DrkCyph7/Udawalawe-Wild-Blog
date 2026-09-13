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
      <div className="upload">
        <div>
          <strong>Add photographs</strong>
          <span>(Max {maxFiles}, up to {maxSizeMB}MB each)</span>
        </div>
        
        {images.length < maxFiles && (
          <label className="cursor-pointer ml-auto border border-[#d8d5ca] bg-transparent py-[9px] px-[13px] text-[10px] hover:bg-[#e2dfd5] transition-colors">
            Choose files
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

      {images.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4">
          {images.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative w-24 h-24 sm:w-28 sm:h-28 group">
              <img 
                src={URL.createObjectURL(file)} 
                alt={`preview ${index}`} 
                className="object-cover w-full h-full border border-[#d8d5ca]"
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
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  )
}

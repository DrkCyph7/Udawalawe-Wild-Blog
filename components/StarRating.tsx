'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none p-1 transition-colors"
        >
          <Star 
            size={24} 
            className={`${
              star <= (hover || value) 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-zinc-300 dark:text-zinc-700'
            }`} 
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-zinc-500 w-4">{value > 0 ? value : ''}</span>
    </div>
  )
}

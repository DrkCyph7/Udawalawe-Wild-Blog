import { Star } from 'lucide-react'

export function Rating({ value, large = false }: { value: number; large?: boolean }) { 
  return (
    <div className={`rating ${large ? 'rating-large' : ''}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star 
          key={i} 
          size={large ? 17 : 13} 
          fill={i <= Math.round(value) ? 'currentColor' : 'none'} 
        />
      ))} 
      <span>{value}</span>
    </div>
  ) 
}

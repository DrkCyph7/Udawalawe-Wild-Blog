export function StatsBar({ 
  stories, 
  contributors, 
  categories 
}: { 
  stories: number
  contributors: number
  categories: number
}) {
  return (
    <div className="flex flex-row items-center justify-center max-sm:grid max-sm:grid-cols-3 max-sm:gap-2 gap-8 py-8 border-y border-[#d8d5ca] my-12 bg-[#fbfaf6] w-full">
      <div className="text-center px-4">
        <span className="block text-2xl font-serif text-[#2a3c30] mb-1">{stories}</span>
        <span className="text-xs uppercase tracking-widest text-[#768078] font-semibold">Stories</span>
      </div>
      <div className="text-[#d8d5ca] hidden sm:block">|</div>
      <div className="text-center px-4">
        <span className="block text-2xl font-serif text-[#2a3c30] mb-1">{contributors}</span>
        <span className="text-xs uppercase tracking-widest text-[#768078] font-semibold">Contributors</span>
      </div>
      <div className="text-[#d8d5ca] hidden sm:block">|</div>
      <div className="text-center px-4">
        <span className="block text-2xl font-serif text-[#2a3c30] mb-1">{categories}</span>
        <span className="text-xs uppercase tracking-widest text-[#768078] font-semibold">Categories</span>
      </div>
    </div>
  )
}

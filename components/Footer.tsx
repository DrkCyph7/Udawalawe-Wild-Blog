import Image from 'next/image'

export function Footer() {
  return (
    <footer>
      <div className="flex items-center gap-4 mb-2 md:mb-0">
        <Image src="/blog/logo-black.png" alt="Udawalawe Wild Logo" width={120} height={32} className="h-6 w-auto object-contain opacity-70" />
        <span>© 2024 Udawalawe Wild</span>
      </div>
      <span>Made with respect for wild places.</span>
      <span>Community guidelines · Privacy</span>
    </footer>
  )
}

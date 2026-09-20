'use client'

import Image from 'next/image'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[#e2ddd5] bg-[#f7f5ef] mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left — Logo + copyright */}
        <div className="flex items-center gap-3">
          <Image
            src="/blog/logo-black.png"
            alt="Udawalawe Wild"
            width={110}
            height={28}
            className="h-6 w-auto object-contain opacity-60"
          />
          <span className="text-[#9ea99f] text-[11px]">© {year} Udawalawe Wild</span>
        </div>

        {/* Centre — tagline */}
        <span className="text-[#9ea99f] text-[11px] tracking-wide hidden md:block">
          Made with respect for wild places.
        </span>

        {/* Right — links + credit */}
        <div className="flex flex-col items-center md:items-end gap-1.5">
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://www.udawalawe-wild.com/terms"
              className="text-[#768078] hover:text-[#304936] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms
            </a>
            <span className="text-[#c8c4bc]">·</span>
            <a
              href="https://www.udawalawe-wild.com/privacy"
              className="text-[#768078] hover:text-[#304936] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
          </div>
          <p className="text-[10px] text-[#b0aba4]">
            Designed &amp; developed by{' '}
            <a
              href="https://nexcy.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#768078] hover:text-[#304936] transition-colors font-medium"
            >
              Nexcy Technologies
            </a>
          </p>
        </div>

      </div>
    </footer>
  )
}

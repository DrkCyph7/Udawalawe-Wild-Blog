import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <CheckCircle2 size={64} className="mx-auto mb-6 text-green-500" />
        <h1 className="text-3xl font-serif mb-4">Thanks — your post is under review</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
          Our team will review your submission to ensure it meets our community guidelines. 
          You'll see it on the blog once approved.
        </p>
        <Link 
          href="/" 
          className="dark-button !inline-flex justify-center items-center gap-2 px-6 py-3"
        >
          Return to blog feed <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  )
}

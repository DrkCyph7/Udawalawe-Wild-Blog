'use client'

import { useState } from 'react'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function Auth({ signup }: { signup?: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (signup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCredential.user, { displayName: name })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      router.push('/blog')
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-art">
        <img src="https://images.unsplash.com/photo-1534567110243-8875d64ca8ff?auto=format&fit=crop&w=1200&q=85" alt="Wild elephant in the forest"/>
        <div>
          <span className="brand-mark">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </span>
          <p>Join a community<br/><i>that looks closer.</i></p>
        </div>
      </div>
      <div className="auth-form">
        <Link href="/blog" className="back-link !inline-flex items-center"><ChevronLeft size={16}/> Back to stories</Link>
        <div className="form-inner">
          <p className="eyebrow">{signup ? 'Become a contributor' : 'Welcome back'}</p>
          <h1>{signup ? <>Make room for<br/><i>the wild.</i></> : <>Good to see<br/><i>you again.</i></>}</h1>
          <p className="form-intro">{signup ? 'Create an account to share your field notes and join the conversation.' : 'Sign in to keep exploring and share your own stories.'}</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            
            {signup && (
              <label>Full name
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required={signup} />
              </label>
            )}
            <label>Email address
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </label>
            <label>Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} />
            </label>
            {signup && (
              <label className="check flex items-center gap-2 cursor-pointer">
                <input type="checkbox" required /> I agree to the community guidelines
              </label>
            )}
            
            <button type="submit" disabled={loading} className="dark-button full !inline-flex justify-center items-center gap-2 mt-2">
              {loading ? 'Please wait...' : (signup ? 'Create my account' : 'Sign in')} <ArrowRight size={16}/>
            </button>
          </form>

          <p className="switch mt-6">
            {signup ? 'Already a member?' : 'New to Udawalawe Wild?'} 
            <Link href={signup ? '/blog/login' : '/blog/signup'} className="ml-2 font-medium text-black">
              {signup ? 'Sign in' : 'Join the community'}
            </Link>
          </p>
        </div>
      </div>
    </main>
  ) 
}

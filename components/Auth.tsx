'use client'

import { useState } from 'react'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function Auth({ signup }: { signup?: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push('/blog')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred during Google sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-art">
        <img src="/auth-bg.png" alt="Wild elephant in the forest"/>
        <div>
          <span className="brand-mark">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </span>
          <p>Join a community<br/><i>that looks closer.</i></p>
        </div>
      </div>
      <div className="auth-form">
        <Link href="/" className="back-link !inline-flex items-center"><ChevronLeft size={16}/> Back to stories</Link>
        <div className="form-inner">
          <p className="eyebrow">{signup ? 'Become a contributor' : 'Welcome back'}</p>
          <h1>{signup ? <>Make room for<br/><i>the wild.</i></> : <>Good to see<br/><i>you again.</i></>}</h1>
          <p className="form-intro">{signup ? 'Create an account to share your field notes and join the conversation.' : 'Sign in to keep exploring and share your own stories.'}</p>
          
          <button 
            type="button" 
            onClick={handleGoogleSignIn} 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-2 border border-[#d8d5ca] py-3 text-sm font-medium hover:bg-[#fbfaf6] transition-colors mb-4"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-[#d8d5ca]" />
            <span className="text-[10px] uppercase tracking-widest text-[#768078]">or</span>
            <hr className="flex-1 border-[#d8d5ca]" />
          </div>

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-1">
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

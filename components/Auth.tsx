import { ArrowRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function Auth({ signup }: { signup?: boolean }) { 
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
          {signup && <label>Full name<input placeholder="Your name"/></label>}
          <label>Email address<input type="email" placeholder="you@example.com"/></label>
          <label>Password<input type="password" placeholder="At least 8 characters"/></label>
          {signup && <label className="check flex items-center gap-2 cursor-pointer"><input type="checkbox"/> I agree to the community guidelines</label>}
          <Link href="/blog" className="dark-button full !inline-flex justify-center items-center gap-2">{signup ? 'Create my account' : 'Sign in'} <ArrowRight size={16}/></Link>
          <p className="switch">
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

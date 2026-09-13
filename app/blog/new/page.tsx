'use client'

import { useState } from 'react'
import { ChevronLeft, Send, Star, Upload } from 'lucide-react'
import Link from 'next/link'

export default function NewStory() { 
  const [mode, setMode] = useState<'story'|'review'>('story'); 
  return (
    <main className="new-page">
      <div className="new-top">
        <Link href="/blog" className="back-link !inline-flex items-center"><ChevronLeft size={16}/> Cancel</Link>
        <span className="save-status">Draft saved just now</span>
      </div>
      <div className="new-inner">
        <p className="eyebrow">Contribute to the journal</p>
        <h1>Tell us what<br/><i>you saw.</i></h1>
        <div className="toggle">
          <button className={mode === 'story' ? 'selected' : ''} onClick={() => setMode('story')}>Write a story</button>
          <button className={mode === 'review' ? 'selected' : ''} onClick={() => setMode('review')}>Leave a review</button>
        </div>
        {mode === 'story' ? (
          <>
            <label>Story title<input placeholder="Give your story a title"/></label>
            <label>What did you see?<textarea placeholder="Start writing your field notes..." rows={7}/></label>
            <div className="form-row">
              <label>Location<input placeholder="e.g. Udawalawe National Park"/></label>
              <label>Story type
                <select defaultValue="">
                  <option value="" disabled>Choose a category</option>
                  <option>Wildlife</option>
                  <option>Travel tips</option>
                  <option>Conservation</option>
                </select>
              </label>
            </div>
            <div className="upload">
              <Upload size={20}/>
              <div>
                <strong>Add photographs</strong>
                <span>Drag and drop, or browse · Up to 10MB each</span>
              </div>
              <button>Browse files</button>
            </div>
          </>
        ) : (
          <>
            <label>Which place are you reviewing?<input placeholder="Search destinations"/></label>
            <label>Your rating
              <div className="star-select flex gap-2">
                {[1,2,3,4,5].map(i => <Star key={i} size={29} fill={i < 5 ? 'currentColor' : 'none'} className="text-stone-300" />)}
              </div>
            </label>
            <label>Your experience<textarea placeholder="What should other visitors know?" rows={7}/></label>
          </>
        )}
        <div className="submit-row mt-8">
          <span>Stories are reviewed before publishing.</span>
          <Link href="/blog" className="dark-button !inline-flex justify-center items-center gap-2">Submit for review <Send size={15}/></Link>
        </div>
      </div>
    </main>
  ) 
}

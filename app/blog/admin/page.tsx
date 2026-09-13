'use client'

import { useState } from 'react'
import { Eye, Check, X } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() { 
  const [rows, setRows] = useState(['A day beside the Walawe', 'Why the langur matters', 'The road less travelled']); 
  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Editor workspace</p>
          <h1>Story queue</h1>
        </div>
        <Link href="/blog" className="outline-button !inline-flex items-center gap-2">View public journal <Eye size={15}/></Link>
      </div>
      <div className="admin-stats">
        <div><span>Awaiting review</span><strong>{rows.length}</strong></div>
        <div><span>Published this month</span><strong>12</strong></div>
        <div><span>Community members</span><strong>284</strong></div>
      </div>
      <section className="queue">
        <div className="queue-title">
          <h2>Needs your attention</h2>
          <span>Newest first</span>
        </div>
        {rows.map((title, i) => (
          <div className="queue-row" key={title}>
            <span className="queue-avatar">{String.fromCharCode(65+i)}</span>
            <div className="queue-copy">
              <strong>{title}</strong>
              <span>{['Maya de Silva','Kavindu Perera','Ishara Gunaratne'][i]} · {i+1} day{i ? 's' : ''} ago</span>
            </div>
            <span className="queue-type">{i === 1 ? 'Conservation' : 'Wildlife'}</span>
            <button aria-label="Approve" onClick={() => setRows(rows.filter(r => r !== title))}><Check size={17}/></button>
            <button aria-label="Reject"><X size={17}/></button>
          </div>
        ))}
      </section>
    </main>
  ) 
}

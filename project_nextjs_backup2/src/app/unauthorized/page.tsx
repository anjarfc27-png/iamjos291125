'use client'

import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div style={{maxWidth: '720px', margin: '2rem auto', backgroundColor: 'white', border: '1px solid #ddd'}}>
      <div style={{padding: '1rem 1.25rem', borderBottom: '1px solid #ddd'}}>
        <h1 style={{margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#002C40'}}>Unauthorized</h1>
      </div>
      <div style={{padding: '1.25rem'}}>
        <p style={{margin: '0 0 1rem 0', color: '#333'}}>Anda tidak memiliki akses ke halaman ini.</p>
        <p style={{margin: '0 0 1.25rem 0', color: '#666', fontSize: '0.875rem'}}>Silakan kembali ke beranda atau masuk dengan akun yang memiliki peran yang sesuai.</p>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <Link href="/" style={{backgroundColor: 'white', border: '1px solid #ddd', padding: '0.375rem 0.75rem', fontSize: '0.875rem', color: '#006798', textDecoration: 'none'}}>Home</Link>
          <Link href="/login" style={{backgroundColor: 'white', border: '1px solid #ddd', padding: '0.375rem 0.75rem', fontSize: '0.875rem', color: '#006798', textDecoration: 'none'}}>Login</Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { withAuth } from '@/lib/auth-client'

function ReviewerDashboardPage() {
  return (
    <div style={{padding: '0'}}>
      <div style={{marginBottom: '1.5rem'}}>
        <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#002C40'}}>Reviewer Dashboard</h1>
        <p style={{color: '#666', margin: 0, fontSize: '0.875rem'}}>Monitor tugas review dan riwayat penilaian</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem'}}>
        <div style={{backgroundColor: 'white', border: '1px solid #ddd'}}>
          <div style={{padding: '0.75rem 1rem', borderBottom: '1px solid #ddd'}}>
            <h2 style={{fontSize: '1rem', fontWeight: 'bold', color: '#002C40', margin: 0}}>Review Assignments</h2>
          </div>
          <div style={{padding: '1rem'}}>
            <p style={{fontSize: '0.875rem', color: '#666', margin: '0 0 0.75rem 0'}}>Lihat dan kerjakan penugasan review yang aktif.</p>
            <Link href="/reviewer/assignments" style={{backgroundColor: 'white', border: '1px solid #ddd', padding: '0.375rem 0.75rem', fontSize: '0.875rem', color: '#006798', textDecoration: 'none'}}>Buka Assignments</Link>
          </div>
        </div>

        <div style={{backgroundColor: 'white', border: '1px solid #ddd'}}>
          <div style={{padding: '0.75rem 1rem', borderBottom: '1px solid #ddd'}}>
            <h2 style={{fontSize: '1rem', fontWeight: 'bold', color: '#002C40', margin: 0}}>Completed Reviews</h2>
          </div>
          <div style={{padding: '1rem'}}>
            <p style={{fontSize: '0.875rem', color: '#666', margin: '0 0 0.75rem 0'}}>Tinjau ulang review yang telah diselesaikan.</p>
            <Link href="/reviewer/completed" style={{backgroundColor: 'white', border: '1px solid #ddd', padding: '0.375rem 0.75rem', fontSize: '0.875rem', color: '#006798', textDecoration: 'none'}}>Lihat Completed</Link>
          </div>
        </div>

        <div style={{backgroundColor: 'white', border: '1px solid #ddd'}}>
          <div style={{padding: '0.75rem 1rem', borderBottom: '1px solid #ddd'}}>
            <h2 style={{fontSize: '1rem', fontWeight: 'bold', color: '#002C40', margin: 0}}>Review History</h2>
          </div>
          <div style={{padding: '1rem'}}>
            <p style={{fontSize: '0.875rem', color: '#666', margin: '0 0 0.75rem 0'}}>Riwayat kegiatan review yang pernah dilakukan.</p>
            <Link href="/reviewer/history" style={{backgroundColor: 'white', border: '1px solid #ddd', padding: '0.375rem 0.75rem', fontSize: '0.875rem', color: '#006798', textDecoration: 'none'}}>Lihat History</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(ReviewerDashboardPage, 'reviewer')
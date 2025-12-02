'use client'

import { withAuth } from '@/lib/auth-client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function AuthorHomePage() {
  const router = useRouter()
  useEffect(() => {
    // Di OJS PKP 3.3, Author Dashboard langsung menampilkan submissions list
    router.replace('/author/dashboard')
  }, [router])
  return null
}

export default withAuth(AuthorHomePage, 'author')
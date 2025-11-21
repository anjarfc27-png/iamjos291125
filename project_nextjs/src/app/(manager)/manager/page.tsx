'use client'

import { withAuth } from '@/lib/auth-client'
import { redirect } from 'next/navigation'

function ManagerLandingPage() {
  redirect('/admin/site-management/hosted-journals')
  return null
}

export default withAuth(ManagerLandingPage, 'manager')
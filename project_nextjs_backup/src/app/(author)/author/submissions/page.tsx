'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/auth-client'

function AuthorSubmissions() {
  const router = useRouter();
  
  useEffect(() => {
    // Di OJS PKP 3.3, "My Submissions" adalah bagian dari Dashboard
    // Redirect ke dashboard karena dashboard sudah menampilkan submissions table
    router.replace('/author/dashboard');
  }, [router]);
  
  return null;
}

export default withAuth(AuthorSubmissions, 'author')

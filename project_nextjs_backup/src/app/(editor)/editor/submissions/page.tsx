"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect /editor/submissions to /editor
 * This ensures consistency with OJS 3.3 where dashboard/submissions is the main route
 */
export default function SubmissionsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/editor");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-[var(--muted)]">Redirecting to Submissions...</p>
      </div>
    </div>
  );
}
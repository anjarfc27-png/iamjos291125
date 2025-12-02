'use client'

// Pass-through layout - sidebar handled by editor/layout.tsx
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
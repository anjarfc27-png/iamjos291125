import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { RolePath } from "@/lib/permissions";

export const EDITOR_ROLES: RolePath[] = ["admin", "manager", "editor", "section_editor"];
export const LIBRARY_BUCKET = "library-files";

export type LibraryFileRow = {
  id: string;
  context_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  original_file_name?: string | null;
  storage_path?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export function mapLibraryFile(row: LibraryFileRow) {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    displaySize: formatBytes(row.file_size),
    originalFileName: row.original_file_name ?? null,
    storagePath: row.storage_path ?? null,
    description: (metadata.description as string | null) ?? null,
    remoteUrl: (metadata.remoteUrl as string | null) ?? null,
    stage: (metadata.stage as string | null) ?? "general",
    source: (metadata.source as "upload" | "remote" | undefined) ?? (metadata.remoteUrl ? "remote" : "upload"),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function uploadLibraryFile(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  file: File,
  journalId: string,
  label: string,
) {
  await ensureBucketExists(supabase, LIBRARY_BUCKET);
  const timestamp = Date.now();
  const extension = file.name.includes(".") ? `.${file.name.split(".").pop()}` : "";
  const sanitized = slugify(label || file.name || "library-file");
  const path = `${journalId}/${timestamp}-${sanitized}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(LIBRARY_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return { path, size: file.size };
}

export async function ensureBucketExists(supabase: ReturnType<typeof getSupabaseAdminClient>, bucket: string) {
  const { data, error } = await supabase.storage.getBucket(bucket);
  if (data && !error) {
    return;
  }
  const { error: createError } = await supabase.storage.createBucket(bucket, { public: false });
  if (createError && !createError.message?.includes("already exists")) {
    throw createError;
  }
}

export function formatBytes(value: number) {
  if (!value) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function handleError(error: unknown) {
  if (error instanceof Error && (error as any).status) {
    return NextResponse.json({ ok: false, message: error.message }, { status: (error as any).status });
  }
  console.error("Library files API error:", error);
  return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "library-file";
}



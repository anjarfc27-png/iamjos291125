import { NextResponse, type NextRequest } from "next/server";

import {
  addJournalUserRole,
  listJournalUserRoles,
  removeJournalUserRole,
} from "@/app/(admin)/admin/site-management/hosted-journals/actions";
import { requireJournalRole } from "@/lib/permissions";
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ journalId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { journalId } = await context.params;

    // Check permissions - only journal managers and admins can view user roles
    await requireJournalRole(request, journalId, ["admin", "manager"]);

    const rows = await listJournalUserRoles(journalId);
    const grouped = rows.reduce<
      Record<string, { userId: string; roles: { role: string; assignedAt: string }[] }>
    >((acc, row) => {
      if (!acc[row.user_id]) {
        acc[row.user_id] = { userId: row.user_id, roles: [] };
      }
      acc[row.user_id].roles.push({ role: row.role, assignedAt: row.assigned_at });
      return acc;
    }, {});
    return NextResponse.json({ ok: true, assignments: Object.values(grouped) });
  } catch (error: any) {
    if (error.status === 403 || error.status === 401) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ ok: false, message: "Tidak dapat memuat pengguna jurnal." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { journalId } = await context.params;

    // Only journal managers and admins can add roles
    await requireJournalRole(request, journalId, ["admin", "manager"]);

    const body = await request.json();
    const userId = body?.userId;
    const role = body?.role;

    if (!userId || !role) {
      return NextResponse.json({ ok: false, message: "Pengguna dan peran wajib diisi." }, { status: 400 });
    }

    const result = await addJournalUserRole(journalId, userId, role);
    if (!result.success) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.status === 403 || error.status === 401) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ ok: false, message: "Tidak dapat menambahkan pengguna." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { journalId } = await context.params;

    // Only journal managers and admins can remove roles
    await requireJournalRole(request, journalId, ["admin", "manager"]);

    const body = await request.json();
    const userId = body?.userId;
    const role = body?.role;

    if (!userId || !role) {
      return NextResponse.json({ ok: false, message: "Pengguna dan peran wajib diisi." }, { status: 400 });
    }

    const result = await removeJournalUserRole(journalId, userId, role);
    if (!result.success) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.status === 403 || error.status === 401) {
      return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ ok: false, message: "Tidak dapat menghapus peran pengguna." }, { status: 500 });
  }
}


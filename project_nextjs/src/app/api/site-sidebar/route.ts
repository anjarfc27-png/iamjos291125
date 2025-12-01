import { NextResponse } from "next/server";
import { getSiteAppearanceSetup } from "@/app/(admin)/admin/site-settings/actions";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setup = await getSiteAppearanceSetup();
    return NextResponse.json({ ok: true, sidebar: setup.sidebar ?? [] });
  } catch {
    return NextResponse.json({ ok: false, sidebar: [] }, { status: 500 });
  }
}

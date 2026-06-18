export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { recalculateGenerations } from "@/lib/recalculateGenerations";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.relationship.delete({ where: { id } });
    await recalculateGenerations();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

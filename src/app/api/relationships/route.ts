import { prisma } from "@/lib/prisma";
import { recalculateGenerations } from "@/lib/recalculateGenerations";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const relationships = await prisma.relationship.findMany();
  return NextResponse.json(relationships);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rel = await prisma.relationship.create({ data: body });
    await recalculateGenerations();
    return NextResponse.json(rel, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

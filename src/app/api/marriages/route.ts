import { prisma } from "@/lib/prisma";
import { recalculateGenerations } from "@/lib/recalculateGenerations";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const marriages = await prisma.marriage.findMany();
  return NextResponse.json(marriages);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const marriage = await prisma.marriage.create({ data: body });
    await recalculateGenerations();
    return NextResponse.json(marriage, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

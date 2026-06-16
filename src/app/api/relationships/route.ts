import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const relationships = await prisma.relationship.findMany();
  return NextResponse.json(relationships);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rel = await prisma.relationship.create({ data: body });
  return NextResponse.json(rel, { status: 201 });
}

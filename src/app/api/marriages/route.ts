import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const marriages = await prisma.marriage.findMany();
  return NextResponse.json(marriages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const marriage = await prisma.marriage.create({ data: body });
  return NextResponse.json(marriage, { status: 201 });
}

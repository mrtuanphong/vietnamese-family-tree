import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Always single clan — get first or null
export async function GET() {
  const clan = await prisma.clan.findFirst({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(clan);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const clan = await prisma.clan.create({ data: body });
  return NextResponse.json(clan, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const existing = await prisma.clan.findFirst({ orderBy: { createdAt: "asc" } });
  if (!existing) {
    const clan = await prisma.clan.create({ data: body });
    return NextResponse.json(clan, { status: 201 });
  }
  const clan = await prisma.clan.update({ where: { id: existing.id }, data: body });
  return NextResponse.json(clan);
}

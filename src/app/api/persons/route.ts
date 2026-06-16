import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const persons = await prisma.person.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(persons);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const person = await prisma.person.create({ data: body });
  return NextResponse.json(person, { status: 201 });
}

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const persons = await prisma.person.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(persons);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...data } = await req.json();
    const person = await prisma.person.create({ data });
    return NextResponse.json(person, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

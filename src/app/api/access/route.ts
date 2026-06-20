export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const clan = await prisma.clan.findFirst();
    return NextResponse.json({ public: clan?.enabled ?? true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone) return NextResponse.json({ granted: false });

    const clan = await prisma.clan.findFirst();

    // Guest account — only when public
    if (clan?.enabled && phone === "do" && password === "do") {
      return NextResponse.json({ granted: true, name: "Tài khoản khách", canEdit: false });
    }

    if (!clan?.superAdminId) return NextResponse.json({ granted: false });

    const superAdmin = await prisma.person.findUnique({ where: { id: clan.superAdminId } });
    const normalize = (p: string) => p.replace(/\s|-/g, "");
    const granted =
      !!superAdmin?.phone && normalize(superAdmin.phone) === normalize(phone);

    const name = granted
      ? [superAdmin!.lastName, superAdmin!.middleName, superAdmin!.firstName].filter(Boolean).join(" ")
      : null;

    return NextResponse.json({ granted, name, canEdit: granted });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

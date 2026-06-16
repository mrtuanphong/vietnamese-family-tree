import { prisma } from "./prisma";
import { calcGenerations } from "./calcGenerations";
import type { Person, Relationship, Marriage } from "@/types";

export async function recalculateGenerations() {
  const [clan, persons, relationships, marriages] = await Promise.all([
    prisma.clan.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.person.findMany(),
    prisma.relationship.findMany(),
    prisma.marriage.findMany(),
  ]);

  if (!clan?.superAdminId || !clan?.superAdminGeneration) return;

  const genMap = calcGenerations(
    persons as unknown as Person[],
    relationships as unknown as Relationship[],
    marriages as unknown as Marriage[],
    clan.superAdminId,
    clan.superAdminGeneration
  );

  await Promise.all(
    Array.from(genMap.entries()).map(([id, generation]) =>
      prisma.person.update({ where: { id }, data: { generation } })
    )
  );
}

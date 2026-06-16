import type { Person, Relationship, Marriage } from "@/types";

export function calcGenerations(
  persons: Person[],
  relationships: Relationship[],
  marriages: Marriage[],
  superAdminId: string,
  superAdminGeneration: number
): Map<string, number> {
  const result = new Map<string, number>();

  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();
  const spouses = new Map<string, string[]>();
  for (const p of persons) {
    parents.set(p.id, []);
    children.set(p.id, []);
    spouses.set(p.id, []);
  }
  for (const rel of relationships) {
    parents.get(rel.childId)?.push(rel.parentId);
    children.get(rel.parentId)?.push(rel.childId);
  }
  for (const m of marriages) {
    spouses.get(m.spouse1Id)?.push(m.spouse2Id);
    spouses.get(m.spouse2Id)?.push(m.spouse1Id);
  }

  // BFS from super admin
  result.set(superAdminId, superAdminGeneration);
  const queue: string[] = [superAdminId];

  while (queue.length > 0) {
    const id = queue.shift()!;
    const gen = result.get(id)!;

    for (const parentId of parents.get(id) ?? []) {
      if (!result.has(parentId)) {
        result.set(parentId, gen - 1);
        queue.push(parentId);
      }
    }
    for (const childId of children.get(id) ?? []) {
      if (!result.has(childId)) {
        result.set(childId, gen + 1);
        queue.push(childId);
      }
    }
    for (const spouseId of spouses.get(id) ?? []) {
      if (!result.has(spouseId)) {
        result.set(spouseId, gen);
        queue.push(spouseId);
      }
    }
  }

  return result;
}

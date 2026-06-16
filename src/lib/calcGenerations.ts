import type { Person, Relationship } from "@/types";

export function calcGenerations(
  persons: Person[],
  relationships: Relationship[],
  superAdminId: string,
  superAdminGeneration: number
): Map<string, number> {
  const result = new Map<string, number>();

  // Build bidirectional adjacency: id → { parents, children }
  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();
  for (const p of persons) {
    parents.set(p.id, []);
    children.set(p.id, []);
  }
  for (const rel of relationships) {
    parents.get(rel.childId)?.push(rel.parentId);
    children.get(rel.parentId)?.push(rel.childId);
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
  }

  return result;
}

import type { Node, Edge } from "reactflow";
import type { FamilyTreeData, Person } from "@/types";

const NODE_W = 144;
const NODE_H = 110;
const H_GAP = 60;
const V_GAP = 100;

export function buildTreeGraph(data: FamilyTreeData): { nodes: Node[]; edges: Edge[] } {
  const { persons, relationships, marriages } = data;
  const personMap = new Map(persons.map((p) => [p.id, p]));

  // Build child → parents map
  const parentOf = new Map<string, string[]>();
  const childrenOf = new Map<string, string[]>();
  for (const rel of relationships) {
    if (!parentOf.has(rel.childId)) parentOf.set(rel.childId, []);
    parentOf.get(rel.childId)!.push(rel.parentId);
    if (!childrenOf.has(rel.parentId)) childrenOf.set(rel.parentId, []);
    childrenOf.get(rel.parentId)!.push(rel.childId);
  }

  // Assign generations
  const generation = new Map<string, number>();
  const visited = new Set<string>();

  function assignGen(id: string, gen: number) {
    if (visited.has(id)) return;
    visited.add(id);
    const existing = generation.get(id);
    if (existing === undefined || gen > existing) generation.set(id, gen);
    for (const childId of childrenOf.get(id) ?? []) assignGen(childId, gen + 1);
  }

  // Roots = persons with no parents
  const roots = persons.filter((p) => !parentOf.has(p.id));
  roots.forEach((p) => assignGen(p.id, 0));
  // Assign remaining
  persons.forEach((p) => { if (!generation.has(p.id)) generation.set(p.id, 0); });

  // Group by generation
  const byGen = new Map<number, Person[]>();
  for (const p of persons) {
    const g = generation.get(p.id) ?? 0;
    if (!byGen.has(g)) byGen.set(g, []);
    byGen.get(g)!.push(p);
  }

  // Position nodes
  const positions = new Map<string, { x: number; y: number }>();
  for (const [gen, genPersons] of byGen.entries()) {
    const totalWidth = genPersons.length * NODE_W + (genPersons.length - 1) * H_GAP;
    genPersons.forEach((p, i) => {
      positions.set(p.id, {
        x: i * (NODE_W + H_GAP) - totalWidth / 2,
        y: gen * (NODE_H + V_GAP),
      });
    });
  }

  const nodes: Node[] = persons.map((p) => ({
    id: p.id,
    type: "personNode",
    position: positions.get(p.id) ?? { x: 0, y: 0 },
    data: { person: p },
  }));

  const edges: Edge[] = [
    ...relationships.map((rel) => ({
      id: `rel-${rel.id}`,
      source: rel.parentId,
      target: rel.childId,
      style: { stroke: "#94a3b8" },
    })),
    ...marriages.map((m) => ({
      id: `mar-${m.id}`,
      source: m.spouse1Id,
      target: m.spouse2Id,
      type: "straight",
      style: { stroke: "#f472b6", strokeDasharray: "5,5" },
      label: "♥",
    })),
  ];

  return { nodes, edges };
}

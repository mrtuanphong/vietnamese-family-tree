import dagre from "dagre";
import type { Node, Edge } from "reactflow";
import type { FamilyTreeData } from "@/types";

const NODE_W = 144;
const NODE_H = 110;
const H_GAP = 60;
const V_GAP = 80;
const ROW_TOLERANCE = 5;

function rowKey(y: number): number {
  return Math.round(y);
}

// Group positions by y-row (within ROW_TOLERANCE), return map of rowY -> sorted ids
function groupByRow(positions: Map<string, { x: number; y: number }>): Map<number, string[]> {
  const rows = new Map<number, string[]>();
  for (const [id, pos] of positions) {
    let matched: number | null = null;
    for (const ry of rows.keys()) {
      if (Math.abs(ry - pos.y) <= ROW_TOLERANCE) { matched = ry; break; }
    }
    const key = matched ?? rowKey(pos.y);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key)!.push(id);
  }
  return rows;
}

// Push nodes right within each row to eliminate overlaps
function resolveOverlaps(positions: Map<string, { x: number; y: number }>): void {
  const rows = groupByRow(positions);
  for (const ids of rows.values()) {
    if (ids.length <= 1) continue;
    ids.sort((a, b) => positions.get(a)!.x - positions.get(b)!.x);
    for (let i = 1; i < ids.length; i++) {
      const prev = positions.get(ids[i - 1])!;
      const curr = positions.get(ids[i])!;
      const minX = prev.x + NODE_W + H_GAP;
      if (curr.x < minX) curr.x = minX;
    }
  }
}

// Find an x slot next to targetX on the given row that doesn't overlap existing nodes
function findFreeX(
  targetX: number,
  rowIds: string[],
  positions: Map<string, { x: number; y: number }>,
  excludeId: string,
): number {
  const occupied = rowIds
    .filter((id) => id !== excludeId)
    .map((id) => positions.get(id)!.x)
    .sort((a, b) => a - b);

  // Try right of partner first, then left
  const candidates = [targetX + NODE_W + H_GAP, targetX - NODE_W - H_GAP];
  for (const cx of candidates) {
    const overlap = occupied.some((ox) => Math.abs(ox - cx) < NODE_W + H_GAP);
    if (!overlap) return cx;
  }
  // Fallback: place right of partner, resolveOverlaps will fix it
  return targetX + NODE_W + H_GAP;
}

export function buildTreeGraph(data: FamilyTreeData): { nodes: Node[]; edges: Edge[] } {
  const { persons, relationships, marriages } = data;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: H_GAP, ranksep: V_GAP, marginx: 50, marginy: 50 });

  for (const p of persons) g.setNode(p.id, { width: NODE_W, height: NODE_H });
  for (const rel of relationships) g.setEdge(rel.parentId, rel.childId);

  dagre.layout(g);

  const positions = new Map<string, { x: number; y: number }>();
  for (const p of persons) {
    const { x, y } = g.node(p.id);
    positions.set(p.id, { x: x - NODE_W / 2, y: y - NODE_H / 2 });
  }

  const hasParent = new Set(relationships.map((r) => r.childId));
  const hasChild = new Set(relationships.map((r) => r.parentId));

  // Align spouse y-rows and pick non-overlapping x slots
  for (const m of marriages) {
    const p1 = positions.get(m.spouse1Id);
    const p2 = positions.get(m.spouse2Id);
    if (!p1 || !p2) continue;

    const s1Isolated = !hasParent.has(m.spouse1Id) && !hasChild.has(m.spouse1Id);
    const s2Isolated = !hasParent.has(m.spouse2Id) && !hasChild.has(m.spouse2Id);

    if (s2Isolated && !s1Isolated) {
      p2.y = p1.y;
      const rows = groupByRow(positions);
      const rowIds = [...rows.entries()].find(([ry]) => Math.abs(ry - p1.y) <= ROW_TOLERANCE)?.[1] ?? [];
      p2.x = findFreeX(p1.x, rowIds, positions, m.spouse2Id);
    } else if (s1Isolated && !s2Isolated) {
      p1.y = p2.y;
      const rows = groupByRow(positions);
      const rowIds = [...rows.entries()].find(([ry]) => Math.abs(ry - p2.y) <= ROW_TOLERANCE)?.[1] ?? [];
      p1.x = findFreeX(p2.x, rowIds, positions, m.spouse1Id);
    } else if (!s1Isolated && !s2Isolated && p1.y !== p2.y) {
      const targetY = hasChild.has(m.spouse1Id) ? p1.y : hasChild.has(m.spouse2Id) ? p2.y : Math.max(p1.y, p2.y);
      p1.y = targetY;
      p2.y = targetY;
    }
  }

  // Final pass: eliminate any remaining overlaps
  resolveOverlaps(positions);

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
      type: "smoothstep",
      style: { stroke: "#94a3b8" },
    })),
    ...marriages.map((m) => {
      const p1 = positions.get(m.spouse1Id);
      const p2 = positions.get(m.spouse2Id);
      const leftId = (p1 && p2 && p1.x <= p2.x) ? m.spouse1Id : m.spouse2Id;
      const rightId = leftId === m.spouse1Id ? m.spouse2Id : m.spouse1Id;
      return {
        id: `mar-${m.id}`,
        source: leftId,
        target: rightId,
        sourceHandle: "right",
        targetHandle: "left",
        type: "straight",
        style: { stroke: "#f472b6", strokeDasharray: "5,5" },
        label: "♥",
      };
    }),
  ];

  return { nodes, edges };
}

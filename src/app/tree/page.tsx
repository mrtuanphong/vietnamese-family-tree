"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import Link from "next/link";
import { personsApi, relationshipsApi, marriagesApi } from "@/lib/api";
import { buildTreeGraph } from "@/lib/buildTree";
import PersonNode from "@/components/tree/PersonNode";
import PersonSidebar from "@/components/tree/PersonSidebar";
import Modal from "@/components/ui/Modal";
import PersonForm from "@/components/person/PersonForm";
import type { Person, Relationship, Marriage, FamilyTreeData } from "@/types";

const nodeTypes = { personNode: PersonNode };

export default function TreePage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected, setSelected] = useState<Person | null>(null);
  const [editTarget, setEditTarget] = useState<Person | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    const [p, r, m] = await Promise.all([
      personsApi.getAll(),
      relationshipsApi.getAll(),
      marriagesApi.getAll(),
    ]);
    setPersons(p);
    setRelationships(r);
    setMarriages(m);
    return { p, r, m };
  };

  const rebuild = (data: FamilyTreeData, selectPerson?: Person | null) => {
    const { nodes: n, edges: e } = buildTreeGraph(data);
    const withHandlers = n.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onSelect: (person: Person) => setSelected(person),
      },
    }));
    setNodes(withHandlers);
    setEdges(e);
    if (selectPerson) {
      const fresh = data.persons.find((x) => x.id === selectPerson.id);
      setSelected(fresh ?? null);
    }
  };

  useEffect(() => {
    load().then(({ p, r, m }) => rebuild({ persons: p, relationships: r, marriages: m }));
  }, []);

  const refresh = async (keepSelected?: Person | null) => {
    const { p, r, m } = await load();
    rebuild({ persons: p, relationships: r, marriages: m }, keepSelected);
  };

  const handleAddPerson = async (data: Omit<Person, "id">) => {
    await personsApi.create(data);
    setShowAdd(false);
    refresh();
  };

  const handleEditPerson = async (data: Omit<Person, "id">) => {
    if (!editTarget) return;
    await personsApi.update(editTarget.id, data);
    setEditTarget(null);
    refresh(editTarget);
  };

  const handleDeletePerson = async (id: string) => {
    if (!confirm("Xoá người này?")) return;
    await personsApi.delete(id);
    setSelected(null);
    refresh();
  };

  const handleAddChild = async (parentId: string, childId: string) => {
    await relationshipsApi.create({ parentId, childId });
    refresh(selected);
  };

  const handleAddSpouse = async (spouse1Id: string, spouse2Id: string) => {
    await marriagesApi.create({ spouse1Id, spouse2Id });
    refresh(selected);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Danh sách</Link>
          <h1 className="text-lg font-bold">Cây Gia Phả</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Thêm người
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {selected && (
          <PersonSidebar
            person={selected}
            allPersons={persons}
            relationships={relationships}
            marriages={marriages}
            onClose={() => setSelected(null)}
            onEdit={(p) => setEditTarget(p)}
            onDelete={handleDeletePerson}
            onAddChild={handleAddChild}
            onAddSpouse={handleAddSpouse}
          />
        )}
      </div>

      {showAdd && (
        <Modal title="Thêm người" onClose={() => setShowAdd(false)}>
          <PersonForm onSubmit={handleAddPerson} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Sửa thông tin" onClose={() => setEditTarget(null)}>
          <PersonForm initial={editTarget} onSubmit={handleEditPerson} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}
    </div>
  );
}

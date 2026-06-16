"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import Link from "next/link";
import { personsApi, relationshipsApi, marriagesApi } from "@/lib/api";
import { buildTreeGraph } from "@/lib/buildTree";
import PersonNode from "@/components/tree/PersonNode";
import PersonSidebar from "@/components/tree/PersonSidebar";
import Modal from "@/components/ui/Modal";
import PersonForm from "@/components/person/PersonForm";
import { clanApi } from "@/lib/api";
import BottomTabBar from "@/components/ui/BottomTabBar";
import type { Person, Relationship, Marriage, FamilyTreeData } from "@/types";

const nodeTypes = { personNode: PersonNode };

type PendingRelation = { type: "spouse" | "child" | "parent"; anchorId: string };

export default function TreePage() {
  const searchParams = useSearchParams();
  const urlSelectedId = searchParams.get("selected");

  const [persons, setPersons] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected, setSelected] = useState<Person | null>(null);
  const [editTarget, setEditTarget] = useState<Person | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [superAdminId, setSuperAdminId] = useState<string | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  // null = plain add, non-null = create-then-link
  const [pendingRelation, setPendingRelation] = useState<PendingRelation | null>(null);

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

  const rebuild = (data: FamilyTreeData, selectPerson?: Person | null, adminId?: string | null) => {
    const effectiveAdminId = adminId !== undefined ? adminId : superAdminId;
    const { nodes: n, edges: e } = buildTreeGraph(data);
    const selectedId = selectPerson?.id ?? null;
    const withHandlers = n.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isSelected: node.id === selectedId,
        isSuperAdmin: node.id === effectiveAdminId,
        onSelect: (person: Person) => setSelected(person),
        onAddChild: (personId: string) => setPendingRelation({ type: "child", anchorId: personId }),
      },
    }));
    setNodes(withHandlers);
    setEdges(e);
    if (selectPerson) {
      const fresh = data.persons.find((x) => x.id === selectPerson.id);
      setSelected(fresh ?? null);
    }
  };

  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    Promise.all([load(), clanApi.get()]).then(([{ p, r, m }, clan]) => {
      const adminId = clan?.superAdminId ?? null;
      if (adminId) setSuperAdminId(adminId);
      const preselect = urlSelectedId ? p.find((x) => x.id === urlSelectedId) ?? null : null;
      rebuild({ persons: p, relationships: r, marriages: m }, preselect, adminId);
      setInitialLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!initialLoaded || !rfInstance || !urlSelectedId) return;
    setTimeout(() => {
      rfInstance.fitView({ nodes: [{ id: urlSelectedId }], duration: 500, padding: 0.5 });
    }, 100);
  }, [initialLoaded, rfInstance, urlSelectedId]);

  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === (selected?.id ?? null),
          isSuperAdmin: node.id === superAdminId,
        },
      }))
    );
  }, [selected, superAdminId]);

  const refresh = async (keepSelected?: Person | null) => {
    const { p, r, m } = await load();
    rebuild({ persons: p, relationships: r, marriages: m }, keepSelected);
  };

  // Plain "add person" from header button
  const handleAddPerson = async (data: Omit<Person, "id">) => {
    await personsApi.create(data);
    setShowAdd(false);
    refresh();
  };

  // Create new person then immediately link
  const handleCreateAndLink = async (data: Omit<Person, "id">) => {
    if (!pendingRelation) return;
    const newPerson = await personsApi.create(data);
    if (pendingRelation.type === "spouse") {
      await marriagesApi.create({ spouse1Id: pendingRelation.anchorId, spouse2Id: newPerson.id });
    } else if (pendingRelation.type === "child") {
      await relationshipsApi.create({ parentId: pendingRelation.anchorId, childId: newPerson.id });
    } else {
      await relationshipsApi.create({ parentId: newPerson.id, childId: pendingRelation.anchorId });
    }
    setPendingRelation(null);
    refresh(selected);
  };

  const handleAddParent = async (parentId: string, childId: string) => {
    await relationshipsApi.create({ parentId, childId });
    refresh(selected);
  };

  const handleEditPerson = async (data: Omit<Person, "id">) => {
    if (!editTarget) return;
    await personsApi.update(editTarget.id, data);
    setEditTarget(null);
    refresh(editTarget);
  };

  const handleDeletePerson = async (id: string) => {
    const person = persons.find((p) => p.id === id);
    const name = person ? [person.lastName, person.firstName].filter(Boolean).join(" ") : "người này";
    if (!confirm(`Xoá "${name}" khỏi dòng họ?`)) return;
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

  const handleRemoveParent = async (relationshipId: string) => {
    await relationshipsApi.delete(relationshipId);
    refresh(selected);
  };

  const handleRemoveChild = async (relationshipId: string) => {
    await relationshipsApi.delete(relationshipId);
    refresh(selected);
  };

  const handleRemoveSpouse = async (marriageId: string) => {
    await marriagesApi.delete(marriageId);
    refresh(selected);
  };

  const modalTitle = pendingRelation
    ? pendingRelation.type === "spouse"
      ? "Thêm vợ/chồng mới"
      : pendingRelation.type === "child"
      ? "Thêm con mới"
      : "Thêm cha/mẹ mới"
    : "Thêm người";

  const defaultLastName = pendingRelation?.type === "child" || pendingRelation?.type === "parent"
    ? persons.find((p) => p.id === pendingRelation.anchorId)?.lastName
    : pendingRelation?.type === "spouse"
    ? undefined
    : persons[persons.length - 1]?.lastName;

  const defaultGender = pendingRelation?.type === "spouse"
    ? (persons.find((p) => p.id === pendingRelation.anchorId)?.gender === "male" ? "female" : "male")
    : undefined;

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b px-3 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="hidden sm:block text-sm text-gray-500 hover:text-gray-700">← Danh sách</Link>
          <h1 className="text-base sm:text-lg font-bold">Cây Gia Phả</h1>
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
            fitView={!urlSelectedId}
            onInit={setRfInstance}
            nodesDraggable={false}
            nodesConnectable={false}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {selected && (
          <div
            className="fixed inset-0 bg-black/30 z-10 sm:hidden"
            onClick={() => setSelected(null)}
          />
        )}

        {selected && (
          <PersonSidebar
            person={selected}
            allPersons={persons}
            relationships={relationships}
            marriages={marriages}
            superAdminId={superAdminId}
            onClose={() => setSelected(null)}
            onEdit={(p) => setEditTarget(p)}
            onDelete={handleDeletePerson}
            onAddParent={handleAddParent}
            onAddChild={handleAddChild}
            onAddSpouse={handleAddSpouse}
            onCreateAndAddParent={(childId) => setPendingRelation({ type: "parent", anchorId: childId })}
            onCreateAndAddSpouse={(anchorId) => setPendingRelation({ type: "spouse", anchorId })}
            onCreateAndAddChild={(anchorId) => setPendingRelation({ type: "child", anchorId })}
            onRemoveParent={handleRemoveParent}
            onRemoveChild={handleRemoveChild}
            onRemoveSpouse={handleRemoveSpouse}
          />
        )}
      </div>

      <BottomTabBar />

      {/* Plain add */}
      {showAdd && (
        <Modal title="Thêm người" onClose={() => setShowAdd(false)}>
          <PersonForm
            defaultLastName={persons[persons.length - 1]?.lastName}
            onSubmit={handleAddPerson}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {/* Edit */}
      {editTarget && (
        <Modal title="Sửa thông tin" onClose={() => setEditTarget(null)}>
          <PersonForm initial={editTarget} onSubmit={handleEditPerson} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}

      {/* Create + link */}
      {pendingRelation && (
        <Modal title={modalTitle} onClose={() => setPendingRelation(null)}>
          <PersonForm
            defaultLastName={defaultLastName}
            initial={defaultGender ? { gender: defaultGender } : undefined}
            onSubmit={handleCreateAndLink}
            onCancel={() => setPendingRelation(null)}
          />
        </Modal>
      )}
    </div>
  );
}

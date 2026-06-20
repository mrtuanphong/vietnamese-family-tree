"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
import { X, Loader2, Network, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { personsApi, relationshipsApi, marriagesApi } from "@/lib/api";
import { buildTreeGraph } from "@/lib/buildTree";
import PersonNode from "@/components/tree/PersonNode";
import MarriageHubNode from "@/components/tree/MarriageHubNode";
import PersonSidebar from "@/components/tree/PersonSidebar";
import TreeOutline from "@/components/tree/TreeOutline";
import PersonDialog from "@/components/person/PersonDialog";
import { clanApi } from "@/lib/api";
import BottomTabBar from "@/components/ui/BottomTabBar";
import { Input } from "@/components/ui/input";
import type { Person, Relationship, Marriage, FamilyTreeData } from "@/types";

function getSubtreeData(
  rootId: string,
  persons: Person[],
  relationships: Relationship[],
  marriages: Marriage[],
): FamilyTreeData {
  const included = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const curr = queue.shift()!;
    for (const rel of relationships) {
      if (rel.parentId === curr && !included.has(rel.childId)) {
        included.add(rel.childId);
        queue.push(rel.childId);
      }
    }
  }
  for (const m of marriages) {
    if (included.has(m.spouse1Id)) included.add(m.spouse2Id);
    if (included.has(m.spouse2Id)) included.add(m.spouse1Id);
  }
  return {
    persons: persons.filter((p) => included.has(p.id)),
    relationships: relationships.filter((r) => included.has(r.parentId) && included.has(r.childId)),
    marriages: marriages.filter((m) => included.has(m.spouse1Id) && included.has(m.spouse2Id)),
  };
}

const nodeTypes = { personNode: PersonNode, marriageHubNode: MarriageHubNode };

type PendingRelation = { type: "spouse" | "child" | "parent"; anchorId: string };

function TreePageContent() {
  const searchParams = useSearchParams();
  const urlSelectedId = searchParams.get("selected");
  const urlRootId = searchParams.get("root");

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
  const [pendingRelation, setPendingRelation] = useState<PendingRelation | null>(null);
  const [rootPersonId, setRootPersonId] = useState<string | null>(null);
  const rootPersonIdRef = useRef<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [viewMode, setViewMode] = useState<"graph" | "outline">("outline");
  const [outlineSearch, setOutlineSearch] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const outlineMatchCount = outlineSearch
    ? persons.filter((p) =>
        [p.lastName, p.middleName, p.firstName].filter(Boolean).join(" ")
          .toLowerCase().includes(outlineSearch.toLowerCase())
      ).length
    : 0;

  const mutate = async (loadingMsg: string, successMsg: string, fn: () => Promise<void>) => {
    setIsMutating(true);
    const tid = toast.loading(loadingMsg);
    try {
      await fn();
      toast.success(successMsg, { id: tid });
    } catch {
      toast.error("Có lỗi xảy ra", { id: tid });
    } finally {
      setIsMutating(false);
    }
  };

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
        onSelect: (person: Person) => {
            setHighlightId(person.id);
            if (window.innerWidth >= 640) setSelected(person);
          },
        onAddChild: (personId: string) => setPendingRelation({ type: "child", anchorId: personId }),
      },
    }));
    setNodes(withHandlers);
    setEdges(e);
    if (selectPerson) {
      const fresh = data.persons.find((x) => x.id === selectPerson.id);
      setSelected(fresh ?? null);
      setHighlightId(fresh?.id ?? null);
    }
  };

  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    Promise.all([load(), clanApi.get()]).then(([{ p, r, m }, clan]) => {
      const adminId = clan?.superAdminId ?? null;
      if (adminId) setSuperAdminId(adminId);
      const preselect = urlSelectedId ? p.find((x) => x.id === urlSelectedId) ?? null : null;
      if (urlRootId) {
        rootPersonIdRef.current = urlRootId;
        setRootPersonId(urlRootId);
        const subtree = getSubtreeData(urlRootId, p, r, m);
        rebuild(subtree, preselect, adminId);
      } else {
        rebuild({ persons: p, relationships: r, marriages: m }, preselect, adminId);
      }
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
    const activeId = highlightId ?? selected?.id ?? null;
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === activeId,
          isSuperAdmin: node.id === superAdminId,
        },
      }))
    );
  }, [selected, highlightId, superAdminId]);

  const refresh = async (keepSelected?: Person | null) => {
    const { p, r, m } = await load();
    const rootId = rootPersonIdRef.current;
    const data = rootId ? getSubtreeData(rootId, p, r, m) : { persons: p, relationships: r, marriages: m };
    rebuild(data, keepSelected);
  };

  const handleSetRoot = (id: string | null) => {
    rootPersonIdRef.current = id;
    setRootPersonId(id);
    setSelected(null);
    const data = id
      ? getSubtreeData(id, persons, relationships, marriages)
      : { persons, relationships, marriages };
    rebuild(data, null);
    setTimeout(() => rfInstance?.fitView({ duration: 500, padding: 0.15 }), 50);
  };

  // Plain "add person" from header button
  const handleAddPerson = async (data: Omit<Person, "id">) =>
    mutate("Đang thêm người...", "Đã thêm người", async () => {
      await personsApi.create(data);
      await refresh();
    });

  const handleCreateAndLink = async (data: Omit<Person, "id">) => {
    if (!pendingRelation) return;
    const labels: Record<string, string> = { spouse: "vợ/chồng", child: "con", parent: "cha/mẹ" };
    return mutate(`Đang thêm ${labels[pendingRelation.type]}...`, `Đã thêm ${labels[pendingRelation.type]}`, async () => {
      const newPerson = await personsApi.create(data);
      if (pendingRelation.type === "spouse") {
        await marriagesApi.create({ spouse1Id: pendingRelation.anchorId, spouse2Id: newPerson.id });
      } else if (pendingRelation.type === "child") {
        await relationshipsApi.create({ parentId: pendingRelation.anchorId, childId: newPerson.id });
      } else {
        await relationshipsApi.create({ parentId: newPerson.id, childId: pendingRelation.anchorId });
      }
      setPendingRelation(null);
      await refresh(selected);
    });
  };

  const handleAddParent = (parentId: string, childId: string) =>
    mutate("Đang thêm cha/mẹ...", "Đã thêm cha/mẹ", async () => {
      await relationshipsApi.create({ parentId, childId });
      await refresh(selected);
    });

  const handleEditPerson = async (data: Omit<Person, "id">) => {
    if (!editTarget) return;
    return mutate("Đang lưu...", "Đã lưu", async () => {
      await personsApi.update(editTarget.id, data);
      await refresh(editTarget);
    });
  };

  const handleDeletePerson = async (id: string) => {
    const person = persons.find((p) => p.id === id);
    const name = person ? [person.lastName, person.firstName].filter(Boolean).join(" ") : "người này";
    if (!confirm(`Xoá "${name}" khỏi dòng họ?`)) return;
    await mutate("Đang xoá...", `Đã xoá ${name}`, async () => {
      await personsApi.delete(id);
      setSelected(null);
      await refresh();
    });
  };

  const handleAddChild = (parentId: string, childId: string) =>
    mutate("Đang thêm con...", "Đã thêm con", async () => {
      await relationshipsApi.create({ parentId, childId });
      await refresh(selected);
    });

  const handleAddSpouse = (spouse1Id: string, spouse2Id: string) =>
    mutate("Đang thêm vợ/chồng...", "Đã thêm vợ/chồng", async () => {
      await marriagesApi.create({ spouse1Id, spouse2Id });
      await refresh(selected);
    });

  const handleRemoveParent = (relationshipId: string) =>
    mutate("Đang xoá quan hệ...", "Đã xoá", async () => {
      await relationshipsApi.delete(relationshipId);
      await refresh(selected);
    });

  const handleRemoveChild = (relationshipId: string) =>
    mutate("Đang xoá quan hệ...", "Đã xoá", async () => {
      await relationshipsApi.delete(relationshipId);
      await refresh(selected);
    });

  const handleRemoveSpouse = (marriageId: string) =>
    mutate("Đang xoá quan hệ...", "Đã xoá", async () => {
      await marriagesApi.delete(marriageId);
      await refresh(selected);
    });

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
    <div className="flex flex-col h-[calc(100vh-56px)] bg-white">
      <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center gap-3 shrink-0">
        <Link href="/" className="hidden sm:block md:hidden text-sm text-gray-500 hover:text-gray-700">← Danh sách</Link>
        {isMutating && <Loader2 size={16} className="animate-spin text-gray-400" />}
        {rootPersonId && (() => {
          const rootPerson = persons.find((p) => p.id === rootPersonId);
          const name = rootPerson ? [rootPerson.lastName, rootPerson.middleName, rootPerson.firstName].filter(Boolean).join(" ") : "";
          return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-sm text-brand-700">
              <span>Cây từ: <strong>{name}</strong></span>
              <button
                onClick={() => handleSetRoot(null)}
                className="rounded-full hover:bg-brand-100 p-0.5 transition-colors"
                aria-label="Xem toàn bộ"
              >
                <X size={12} />
              </button>
            </div>
          );
        })()}
        <div className="flex items-center gap-2 shrink-0">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "graph" | "outline")}>
            <TabsList>
              <TabsTrigger value="outline" className="flex items-center gap-1.5">
                <List size={14} />
                Đơn giản
              </TabsTrigger>
              <TabsTrigger value="graph" className="flex items-center gap-1.5">
                <Network size={14} />
                Sơ đồ
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {viewMode === "outline" && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Tìm kiếm..."
                value={outlineSearch}
                onChange={(e) => setOutlineSearch(e.target.value)}
                className="h-8 w-36 text-sm"
              />
              {outlineSearch && (
                <span className="text-xs text-gray-500 shrink-0">{outlineMatchCount} kết quả</span>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 ${viewMode === "outline" ? "flex flex-col" : ""}`}>
          {viewMode === "outline" ? (
            <TreeOutline
              persons={persons}
              relationships={relationships}
              marriages={marriages}
              rootPersonId={rootPersonId}
              selectedId={highlightId ?? selected?.id ?? null}
              superAdminId={superAdminId}
              search={outlineSearch}
              onSelect={(person) => {
                setHighlightId(person.id);
                if (window.innerWidth >= 640) setSelected(person);
              }}
            />
          ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView={!urlSelectedId}
            onInit={setRfInstance}
            nodesDraggable={true}
            nodesConnectable={false}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
          )}
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
            rootPersonId={rootPersonId}
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
            onSetRoot={handleSetRoot}
            isMutating={isMutating}
          />
        )}
      </div>

      <BottomTabBar />

      <PersonDialog
        open={showAdd}
        onOpenChange={(open) => { if (!open) setShowAdd(false); }}
        title="Thêm người"
        defaultLastName={persons[persons.length - 1]?.lastName}
        onSubmit={handleAddPerson}
      />

      <PersonDialog
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        title="Sửa thông tin"
        initial={editTarget ?? undefined}
        onSubmit={handleEditPerson}
      />

      <PersonDialog
        open={!!pendingRelation}
        onOpenChange={(open) => { if (!open) setPendingRelation(null); }}
        title={modalTitle}
        defaultLastName={defaultLastName}
        initial={defaultGender ? { gender: defaultGender } : undefined}
        onSubmit={handleCreateAndLink}
      />
    </div>
  );
}

export default function TreePage() {
  return (
    <Suspense>
      <TreePageContent />
    </Suspense>
  );
}

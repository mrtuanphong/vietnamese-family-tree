import type { Clan, Person, Relationship, Marriage } from "@/types";

const base = "/api";

export const clanApi = {
  get: (): Promise<Clan | null> => fetch(`${base}/clan`).then((r) => r.json()),
  upsert: (data: Omit<Clan, "id">): Promise<Clan> =>
    fetch(`${base}/clan`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
};

async function json<T>(r: Response): Promise<T> {
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error ?? `HTTP ${r.status}`);
  return data as T;
}

export const personsApi = {
  getAll: (): Promise<Person[]> => fetch(`${base}/persons`).then(json<Person[]>),
  getOne: (id: string): Promise<Person> => fetch(`${base}/persons/${id}`).then(json<Person>),
  create: (data: Omit<Person, "id">): Promise<Person> =>
    fetch(`${base}/persons`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(json<Person>),
  update: (id: string, data: Partial<Person>): Promise<Person> =>
    fetch(`${base}/persons/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(json<Person>),
  delete: (id: string): Promise<void> =>
    fetch(`${base}/persons/${id}`, { method: "DELETE" }).then(json<void>),
};

export const relationshipsApi = {
  getAll: (): Promise<Relationship[]> => fetch(`${base}/relationships`).then((r) => r.json()),
  create: (data: Omit<Relationship, "id">): Promise<Relationship> =>
    fetch(`${base}/relationships`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  delete: (id: string): Promise<void> =>
    fetch(`${base}/relationships/${id}`, { method: "DELETE" }).then((r) => r.json()),
};

export const marriagesApi = {
  getAll: (): Promise<Marriage[]> => fetch(`${base}/marriages`).then((r) => r.json()),
  create: (data: Omit<Marriage, "id">): Promise<Marriage> =>
    fetch(`${base}/marriages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  delete: (id: string): Promise<void> =>
    fetch(`${base}/marriages/${id}`, { method: "DELETE" }).then((r) => r.json()),
};

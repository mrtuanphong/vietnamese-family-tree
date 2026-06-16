import type { Person, Relationship, Marriage } from "@/types";

const base = "/api";

export const personsApi = {
  getAll: (): Promise<Person[]> => fetch(`${base}/persons`).then((r) => r.json()),
  getOne: (id: string): Promise<Person> => fetch(`${base}/persons/${id}`).then((r) => r.json()),
  create: (data: Omit<Person, "id">): Promise<Person> =>
    fetch(`${base}/persons`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  update: (id: string, data: Partial<Person>): Promise<Person> =>
    fetch(`${base}/persons/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
  delete: (id: string): Promise<void> =>
    fetch(`${base}/persons/${id}`, { method: "DELETE" }).then((r) => r.json()),
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

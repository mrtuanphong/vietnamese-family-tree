export interface Clan {
  id: string;
  name: string;
  address?: string | null;
  description?: string | null;
  enabled: boolean;
  superAdminId?: string | null;
  superAdminGeneration?: number | null;
}

export type Gender = "male" | "female" | "unknown";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  gender: Gender;
  birthDate?: string | null;
  birthPlace?: string | null;
  deathDateLunar?: string | null;
  deathPlace?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  generation?: number | null;
  childOrder?: number | null;
  createdAt?: string;
}

export interface Relationship {
  id: string;
  parentId: string;
  childId: string;
}

export interface Marriage {
  id: string;
  spouse1Id: string;
  spouse2Id: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface FamilyTreeData {
  persons: Person[];
  relationships: Relationship[];
  marriages: Marriage[];
}

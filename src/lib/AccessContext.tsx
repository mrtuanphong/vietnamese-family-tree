"use client";

import { createContext, useContext } from "react";

interface AccessContextValue {
  canEdit: boolean;
}

export const AccessContext = createContext<AccessContextValue>({ canEdit: true });

export function useAccess() {
  return useContext(AccessContext);
}

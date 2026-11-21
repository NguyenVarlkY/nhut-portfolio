"use client";
/* The portfolio facts (profile, skills, jobs, projects…) as edited in /admin, for client components.
 * Falls back to the code defaults when rendered outside the provider. */
import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_DATA, type BaseData } from "./types";

const Ctx = createContext<BaseData>(DEFAULT_DATA);

export function ContentProvider({ data, children }: { data: BaseData; children: ReactNode }) {
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export const useContent = () => useContext(Ctx);

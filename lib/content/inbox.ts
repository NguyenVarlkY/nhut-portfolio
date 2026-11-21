/* Messages sent from the Contact form, one small file each under inbox/ (no clash when two people write at once). */
import { randomBytes } from "node:crypto";
import { listFiles, pool, readJson, remove, writeJson } from "./storage";

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  lang: string;
  country: string;
  page: string;
  createdAt: number;
  read: boolean;
  starred: boolean;
  /** sent to the owner's email too (Resend configured) */
  emailed: boolean;
}

const PREFIX = "inbox/";
const ID = /^\d{13}-[a-f0-9]{8}$/;
export const isMessageId = (id: string) => ID.test(id);
const file = (id: string) => `${PREFIX}${id}.json`;

export async function saveMessage(m: Omit<Message, "id" | "createdAt" | "read" | "starred">): Promise<Message> {
  const now = Date.now();
  const msg: Message = { ...m, id: `${now}-${randomBytes(4).toString("hex")}`, createdAt: now, read: false, starred: false };
  await writeJson(file(msg.id), msg);
  return msg;
}

export async function listMessages(max = 300): Promise<Message[]> {
  const files = (await listFiles(PREFIX, max)).filter((f) => ID.test(f.path.slice(PREFIX.length, -5)));
  const msgs = await pool(files, 8, (f) => readJson<Message>(f.path));
  return msgs.filter((m): m is Message => !!m).sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateMessage(id: string, patch: Partial<Pick<Message, "read" | "starred">>) {
  if (!ID.test(id)) return null;
  const m = await readJson<Message>(file(id));
  if (!m) return null;
  const next = { ...m, ...(typeof patch.read === "boolean" ? { read: patch.read } : {}), ...(typeof patch.starred === "boolean" ? { starred: patch.starred } : {}) };
  await writeJson(file(id), next);
  return next;
}

export async function deleteMessages(ids: string[]) {
  await remove(ids.filter((id) => ID.test(id)).map(file));
}

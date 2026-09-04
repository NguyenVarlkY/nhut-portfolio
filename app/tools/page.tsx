import { redirect } from "next/navigation";

// Backward-compatible route for old bookmarks and editor references.
export default function ToolsRedirect() {
  redirect("/en/tools");
}

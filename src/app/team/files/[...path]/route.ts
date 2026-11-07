import { get } from "@vercel/blob";
import { checkFileSignature, checkTeamAuth } from "@/lib/server/security";

/*
 * Team-only download of a submitted file from the private Blob store.
 * Access: the shared team password (browser login box), or a short-lived signed
 * link (used so Airtable can fetch image previews).
 */
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.map(decodeURIComponent).join("/");
  const url = new URL(request.url);

  const allowed =
    checkTeamAuth(request.headers.get("authorization")) ||
    checkFileSignature(pathname, url.searchParams.get("exp"), url.searchParams.get("sig"));

  if (!allowed) {
    return new Response("Team login required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="The Mighty Q team", charset="UTF-8"' },
    });
  }
  if (!pathname.startsWith("submissions/")) return new Response("Not found", { status: 404 });

  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) return new Response("Not found", { status: 404 });

  const filename = pathname.split("/").pop() || "file";
  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

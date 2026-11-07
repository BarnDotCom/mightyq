import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { ALLOWED_TYPES, MAX_FILE_BYTES } from "@/lib/server/config";
import { readUploadSession } from "@/lib/server/security";

/*
 * Issues one-off tokens so the browser can upload a file straight to the private
 * Blob store. Only visitors who passed the spam check (they hold an upload session
 * token) get one, and only for their own folder.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = readUploadSession(clientPayload);
        if (!session) throw new Error("Upload session expired. Please reload the page.");
        if (!pathname.startsWith(`submissions/${session.id}/`)) throw new Error("Bad upload path.");
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // The submission itself records the files; nothing to do here.
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

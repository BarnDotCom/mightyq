import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { issueSignedToken } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ALLOWED_TYPES, MAX_FILE_BYTES } from "@/lib/server/config";
import { readUploadSession } from "@/lib/server/security";

/*
 * Issues short-lived presigned URLs so the browser can upload a file straight to
 * the private Blob store. Works with the store's OIDC connection (no static
 * read-write token needed). Only visitors who passed the spam check (they hold an
 * upload session token) get one, and only for their own folder.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadPresignedBody;
  try {
    const json = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname, clientPayload) => {
        const session = readUploadSession(clientPayload);
        if (!session) throw new Error("Upload session expired. Please reload the page.");
        if (!pathname.startsWith(`submissions/${session.id}/`)) throw new Error("Bad upload path.");
        const validUntil = Date.now() + 60 * 60 * 1000;
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          validUntil,
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_FILE_BYTES,
        });
        return {
          token,
          urlOptions: {
            validUntil,
            allowedContentTypes: ALLOWED_TYPES,
            maximumSizeInBytes: MAX_FILE_BYTES,
          },
        };
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    console.error("upload token failed", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

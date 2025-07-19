import { createLocalFileUrl } from "~/server/utils/localStorageUtils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");
    const fileType = searchParams.get("fileType");
    const keepOriginalName = searchParams.get("keepOriginalName") === "true";

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 },
      );
    }

    const localUrl = await createLocalFileUrl(
      fileName,
      fileType,
      keepOriginalName,
    );

    return NextResponse.json({ url: localUrl });
  } catch (error) {
    console.error("Error generating local file URL:", error);
    return NextResponse.json(
      { error: "Failed to generate local file URL" },
      { status: 500 },
    );
  }
}
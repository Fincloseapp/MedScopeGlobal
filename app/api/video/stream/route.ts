import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const VIDEO_DIR = path.join(process.cwd(), "public", "videos");

function isSafeFilename(file: string): boolean {
  if (!file || file.includes("..") || file.includes("/") || file.includes("\\")) return false;
  return /^[\w.-]+\.mp4$/i.test(file);
}

function streamLocalFile(req: NextRequest, file: string): NextResponse {
  const videoPath = path.join(VIDEO_DIR, file);

  if (!videoPath.startsWith(VIDEO_DIR)) {
    return new NextResponse("Invalid file parameter", { status: 400 });
  }

  if (!fs.existsSync(videoPath)) {
    return new NextResponse("Video not found", { status: 404 });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.get("range");

  if (!range) {
    return new NextResponse(fs.readFileSync(videoPath), {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize.toString(),
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  if (Number.isNaN(start) || start >= fileSize || end >= fileSize || start > end) {
    return new NextResponse("Invalid range", {
      status: 416,
      headers: { "Accept-Ranges": "bytes", "Content-Range": `bytes */${fileSize}` },
    });
  }

  const chunkSize = end - start + 1;
  const fileStream = fs.createReadStream(videoPath, { start, end });

  return new NextResponse(fileStream as unknown as BodyInit, {
    status: 206,
    headers: {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize.toString(),
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

async function proxyRemoteUrl(req: NextRequest, remoteUrl: string): Promise<NextResponse> {
  let parsed: URL;
  try {
    parsed = new URL(remoteUrl);
  } catch {
    return new NextResponse("Invalid url parameter", { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return new NextResponse("Invalid url protocol", { status: 400 });
  }

  const range = req.headers.get("range");
  const upstream = await fetch(remoteUrl, {
    headers: range ? { Range: range } : {},
    signal: AbortSignal.timeout(60_000),
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse("Upstream video unavailable", { status: upstream.status });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "video/mp4");
  const contentLength = upstream.headers.get("content-length");
  const contentRange = upstream.headers.get("content-range");
  const acceptRanges = upstream.headers.get("accept-ranges");
  if (contentLength) headers.set("Content-Length", contentLength);
  if (contentRange) headers.set("Content-Range", contentRange);
  headers.set("Accept-Ranges", acceptRanges ?? "bytes");
  headers.set("Cache-Control", "public, max-age=3600");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const file = url.searchParams.get("file");
    const remote = url.searchParams.get("url");

    if (file) {
      if (!isSafeFilename(file)) {
        return new NextResponse("Invalid file parameter", { status: 400 });
      }
      return streamLocalFile(req, file);
    }

    if (remote) {
      return proxyRemoteUrl(req, remote);
    }

    return new NextResponse("Missing file or url parameter", { status: 400 });
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}

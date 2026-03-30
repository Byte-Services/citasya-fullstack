import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_INTERNAL_URL!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: Request, { params }: any) {
  const url = new URL(req.url);
  const target = `${BACKEND}/files/${params.path.join("/")}${url.search}`;

  const res = await fetch(target, { method: "GET" });

  const headers = new Headers(res.headers);
  headers.delete("content-encoding");

  return new NextResponse(await res.arrayBuffer(), {
    status: res.status,
    headers,
  });
}

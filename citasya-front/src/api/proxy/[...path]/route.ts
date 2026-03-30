import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_INTERNAL_URL || "http://localhost:3000";

async function forward(req: Request, pathParts: string[]) {
  try {
    const url = new URL(req.url);
    const target = `${BACKEND}/${pathParts.join("/")}${url.search}`;

    const headers = new Headers(req.headers);
    headers.delete("host");

    const body =
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : await req.arrayBuffer();

    const backendRes = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    const resHeaders = new Headers(backendRes.headers);
    resHeaders.delete("content-encoding");

    return new NextResponse(await backendRes.arrayBuffer(), {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (error) {
    console.error('Error forwarding request: ', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: Request, { params }: any) {
  const resolvedParams = await params;
  return forward(req, resolvedParams.path);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: Request, { params }: any) {
  const resolvedParams = await params;
  return forward(req, resolvedParams.path);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: Request, { params }: any) {
  const resolvedParams = await params;
  return forward(req, resolvedParams.path);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(req: Request, { params }: any) {
  const resolvedParams = await params;
  return forward(req, resolvedParams.path);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: Request, { params }: any) {
  const resolvedParams = await params;
  return forward(req, resolvedParams.path);
}

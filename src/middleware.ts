import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(req: NextRequest) {
  const { device } = userAgent(req);
  const viewport = device.type === "mobile" ? "mobile" : "desktop";

  const headers = new Headers(req.headers);
  headers.set("x-viewport", viewport);

  return NextResponse.next({
    request: {
      headers: headers,
    },
  });
}

export const config = {
  matcher: "/",
};

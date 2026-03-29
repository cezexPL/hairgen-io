import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware — JWT validation happens in API route handlers
// This just passes requests through; auth is checked per-route via getAuthUser()
export default function middleware(_req: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

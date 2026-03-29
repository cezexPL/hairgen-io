import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Clerk middleware disabled for demo — enable when CLERK keys are configured
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

export default function middleware(_req: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

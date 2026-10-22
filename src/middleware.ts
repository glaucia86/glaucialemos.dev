import { NextRequest, NextResponse } from "next/server";
import { preferredLocale } from "@/i18n/config";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") return NextResponse.next();
  const destination = request.nextUrl.clone();
  destination.pathname = `/${preferredLocale(request.headers.get("accept-language"))}`;
  return NextResponse.redirect(destination);
}

export const config = { matcher: ["/"] };

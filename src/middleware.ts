import { NextRequest, NextResponse } from "next/server";
import { preferredLocale } from "./i18n/config";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") return NextResponse.next();
  return NextResponse.redirect(new URL(`/${preferredLocale(request.headers.get("accept-language"))}`, request.url));
}

export const config = { matcher: ["/"] };

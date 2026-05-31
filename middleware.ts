import { NextRequest, NextResponse } from "next/server";

const supportedLocales = new Set(["en", "cs", "de", "pl"]);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (supportedLocales.has(firstSegment)) {
    const withoutLocale = pathname.replace(`/${firstSegment}`, "") || "/";
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = withoutLocale;
    rewriteUrl.search = search;
    const response = NextResponse.rewrite(rewriteUrl);
    response.cookies.set("language", firstSegment, { path: "/", sameSite: "lax" });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};

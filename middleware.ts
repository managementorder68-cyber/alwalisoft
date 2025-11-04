import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/admin", "/user", "/api/protected"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected route
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtected) {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      // Redirect to login
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Token validation would happen here
    // For now, we allow the request to proceed
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/api/protected/:path*"],
}

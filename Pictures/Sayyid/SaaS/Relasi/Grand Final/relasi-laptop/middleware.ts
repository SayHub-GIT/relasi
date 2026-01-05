import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // No middleware route protection needed - using session-based modal
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}

export const config = {
  matcher: [],
}

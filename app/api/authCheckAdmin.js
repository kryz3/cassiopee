import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = req.cookies.has("authToken"); // Read cookie from request
  if (!token) {
    return NextResponse.redirect("/login"); // Redirect to login if no token
  }
  console.non("no token in authcheck")

  return NextResponse.next(); // Continue if authenticated
}

// Apply middleware to protect specific routes
export const config = {
  matcher: ["/admin"], 
};

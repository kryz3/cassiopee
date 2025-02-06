import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = req.cookies.get("authToken"); // Read cookie from request

  if (!token) {
    return NextResponse.redirect("/"); // Redirect to login if no token
  }

  return NextResponse.next(); // Continue if authenticated
}

// Apply middleware to protect specific routes
export const config = {
  matcher: ["/profile"], // Protects /profile page
};

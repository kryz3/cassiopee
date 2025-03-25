import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode("your_secret_key");

export async function middleware(req) {
  const token = req.cookies?.get("authToken")?.value; // Extract token from cookies

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    // Verify JWT Token
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId; // Extract user ID from token

    // If accessing /admin, check user role
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const response = await fetch("http://localhost:5001/User/api/verifyRoleAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
        credentials: "include", // Include cookies in the request
      });

      const data = await response.json();


      if (!data.success) {
        return NextResponse.redirect(new URL("/", req.url)); // Redirect if not admin
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

// Apply middleware to both /profile and /admin
export const config = {
  matcher: ["/profile", "/admin"],
};

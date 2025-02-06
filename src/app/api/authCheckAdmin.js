import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = req.cookies.get("authToken"); // Read cookie from request
  const userId = localStorage.getItem('userID');

  const role = await fetch("http://localhost:5001/User/api/verifyRoleAdmin", 
    {
      method: "POST",
      body: JSON.stringify({
        id: userId
      })
    }
  )

  if (!role.ok) {
    return NextResponse.direct("/")
  }

  if (!token) {

    return NextResponse.redirect("/"); // Redirect to login if no token
  }

  return NextResponse.next(); // Continue if authenticated
}

// Apply middleware to protect specific routes
export const config = {
  matcher: ["/admin"], // Protects /profile page
};

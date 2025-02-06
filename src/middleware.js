import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode("your_secret_key");

export async function middleware(req) {
  const token = req.cookies.get('authToken');

  if (!token) {
    return NextResponse.redirect(new URL('/notoken', req.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/notokenlol', req.url));
  }
}

export const config = {
  matcher: ['/profile'],
};

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  const response = NextResponse.redirect(new URL("/", request.nextUrl));

  if (token) {
    response.cookies.set("token", token, {
      path: "/",
      httpOnly: false, 
      maxAge: 60 * 60 * 24 * 7, 
    });
  }

  return response;
}
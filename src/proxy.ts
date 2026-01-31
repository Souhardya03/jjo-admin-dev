import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to check JWT format locally (without verify signature to save edge compute)
function parseJwt(token: string) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export default function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublic = path === "/login" || path === "/register";

    const token = request.cookies.get("auth-token")?.value || "";
    
    // const tokenData = parseJwt(token);

    if (isPublic && token) {
        return NextResponse.redirect(new URL("/", request.nextUrl));
    }

    if (!isPublic && !token) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
  
    matcher: ["/login", "/", "/register"],
};
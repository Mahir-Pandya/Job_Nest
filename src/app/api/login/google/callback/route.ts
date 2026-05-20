import { google } from "@/lib/auth/google";
import { cookies } from "next/headers";
import { OAuth2Tokens } from "arctic";
import { db } from "@/config/db";
import { users, applicants, employers } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { createSessionAndSetCookies } from "@/features/auth/server/use-cases/sessions";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;

  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    return new Response("Invalid state or code", { status: 400 });
  }

  try {
    const tokens: OAuth2Tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    
    // Fetch user profile from Google
    const googleUserResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });
    
    const googleUser = await googleUserResponse.json();
    const googleId = googleUser.sub;
    const email = googleUser.email;
    const name = googleUser.name;
    const avatarUrl = googleUser.picture;

    // Check if user exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email));

    if (existingUser) {
      // If user exists but doesn't have googleId set, we could update it
      if (!existingUser.googleId) {
        await db.update(users).set({ googleId, avatarUrl }).where(eq(users.id, existingUser.id));
      }
      
      await createSessionAndSetCookies(existingUser.id);
      return Response.redirect(new URL(existingUser.role === "employer" ? "/dashboard" : "/dashboard", request.url));
    }

    // Generate unique username
    const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const userName = `${baseUsername}${uniqueSuffix}`;

    // For new users, we save their profile securely in a cookie and redirect to role selection
    const pendingUserData = JSON.stringify({ googleId, email, name, avatarUrl });
    
    // We sign the data with an HMAC so the user can't tamper with it
    const crypto = await import("crypto");
    const signature = crypto.createHmac("sha256", process.env.GOOGLE_CLIENT_SECRET || "fallback_secret")
      .update(pendingUserData)
      .digest("hex");
      
    const payload = Buffer.from(JSON.stringify({ data: pendingUserData, signature })).toString("base64");

    cookieStore.set("google_oauth_pending_user", payload, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 15, // 15 minutes to complete role selection
      sameSite: "lax",
    });

    return Response.redirect(new URL("/register/role-selection", request.url));
  } catch (e) {
    if (e instanceof Error) {
        console.error("OAuth Error:", e.message);
    }
    return new Response("An error occurred during authentication", { status: 500 });
  }
}

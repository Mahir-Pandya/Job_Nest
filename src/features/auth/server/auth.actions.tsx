"use server";

import { db } from "@/config/db";
import { applicants, employers, users } from "@/drizzle/schema";
import argon2 from "argon2";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import {
  LoginUserData,
  loginUserSchema,
  RegisterUserData,
  registerUserSchema,
  changePasswordSchema,
  ChangePasswordData,
} from "../auth.schema";
import {
  createSessionAndSetCookies,
  invalidateSession,
} from "./use-cases/sessions";
import { getCurrentUser } from "./auth.queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

// ── Register ──────────────────────────────────────────────────────────────────
export const registerUserAction = async (data: RegisterUserData) => {
  console.log("Hii I am register");

  try {
    const { data: validatedData, error } = registerUserSchema.safeParse(data);
    if (error) return { status: "ERROR", message: error.issues[0].message };

    const { name, userName, email, password, role } = validatedData;

    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.userName, userName)));

    if (user) {
      if (user.email === email)
        return { status: "ERROR", message: "Email Already Exists" };
      else
        return {
          status: "ERROR",
          message: "Username Already Exists",
        };
    }

    const hashPassword = await argon2.hash(password);
    console.log("hashPassword: ", hashPassword);

    await db.transaction(async (tx) => {
      const [result] = await tx
        .insert(users)
        .values({ name, userName, email, password: hashPassword, role });

      console.log(result);

      if (role === "applicant") {
        await tx.insert(applicants).values({ id: result.insertId });
      } else {
        await tx.insert(employers).values({ id: result.insertId });
      }

      await createSessionAndSetCookies(result.insertId, tx);
    });

    return {
      status: "SUCCESS",
      message: "Registration Completed Successfully",
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: "Unknown Error Occurred! Please Try Again Later",
    };
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUserAction = async (data: LoginUserData) => {
  try {
    const { data: validatedData, error } = loginUserSchema.safeParse(data);
    if (error) return { status: "ERROR", message: error.issues[0].message };

    const { email, password } = validatedData;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || !user.password) {
      return { status: "ERROR", message: "Invalid Email or Password" };
    }

    const isValidPassword = await argon2.verify(user.password, password);

    if (!isValidPassword)
      return { status: "ERROR", message: "Invalid Email or Password" };

    await createSessionAndSetCookies(user.id);

    return {
      status: "SUCCESS",
      message: "Login Successful",
      role: user.role, // needed by login-form to router.push to the right dashboard
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: "Unknown Error Occurred! Please Try Again Later",
    };
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logoutUserAction = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return redirect("/login");
  console.log(session);

  const hashedToken = crypto
    .createHash("sha-256")
    .update(session)
    .digest("hex");

  await invalidateSession(hashedToken);
  cookieStore.delete("session");

  return redirect("/login");
};


// ── Change Password (logged-in user) ─────────────────────────────────────────
export const changePasswordAction = async (data: ChangePasswordData) => {
  try {
    const { data: validated, error } = changePasswordSchema.safeParse(data);
    if (error) return { status: "ERROR", message: error.issues[0].message };

    const currentUser = await getCurrentUser();
    if (!currentUser) return { status: "ERROR", message: "Not authenticated." };

    // Fetch the raw hashed password from DB
    const [dbUser] = await db
      .select({ id: users.id, password: users.password })
      .from(users)
      .where(eq(users.id, currentUser.id))
      .limit(1);

    if (!dbUser) return { status: "ERROR", message: "User not found." };
    if (!dbUser.password) return { status: "ERROR", message: "User registered with OAuth, cannot change password." };

    // Verify current password
    const isValid = await argon2.verify(dbUser.password, validated.currentPassword);
    if (!isValid) {
      return { status: "ERROR", message: "Current password is incorrect." };
    }

    if (validated.currentPassword === validated.newPassword) {
      return {
        status: "ERROR",
        message: "New password must be different from your current password.",
      };
    }

    const newHashedPassword = await argon2.hash(validated.newPassword);

    await db
      .update(users)
      .set({ password: newHashedPassword })
      .where(eq(users.id, dbUser.id));

    return { status: "SUCCESS", message: "Password changed successfully!" };
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return { status: "ERROR", message: "Something went wrong. Please try again." };
  }
};

// ── Complete Google OAuth Signup ──────────────────────────────────────────────
export const completeGoogleSignupAction = async (role: "applicant" | "employer") => {
  try {
    const cookieStore = await cookies();
    const payloadBase64 = cookieStore.get("google_oauth_pending_user")?.value;

    if (!payloadBase64) {
      return { status: "ERROR", message: "OAuth session expired. Please try again." };
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf8"));
    const { data: pendingUserData, signature } = payload;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.GOOGLE_CLIENT_SECRET || "fallback_secret")
      .update(pendingUserData)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { status: "ERROR", message: "Invalid OAuth session data." };
    }

    const { googleId, email, name, avatarUrl } = JSON.parse(pendingUserData);

    // Generate unique username
    const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const userName = `${baseUsername}${uniqueSuffix}`;

    let newUserId: number = 0;

    await db.transaction(async (tx) => {
      const [result] = await tx.insert(users).values({
        googleId,
        email,
        name,
        userName,
        avatarUrl,
        role: role,
      });

      newUserId = result.insertId;

      if (role === "employer") {
        await tx.insert(employers).values({ id: newUserId });
      } else {
        await tx.insert(applicants).values({ id: newUserId });
      }

      await createSessionAndSetCookies(newUserId, tx);
    });

    cookieStore.delete("google_oauth_pending_user");

    return {
      status: "SUCCESS",
      message: "Registration successful!",
      role,
    };
  } catch (error) {
    console.error("Complete Google Signup Error:", error);
    return {
      status: "ERROR",
      message: "An error occurred during registration.",
    };
  }
};

import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { prisma } from "./db.server";

// Fichier qui gère la session de l'utilisateur (cookie http only)

// déplacer tout ça dans  ????

type LoginForm = {
  email: string;
  password: string;
};

export const login = async ({ email, password }: LoginForm) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // si l'utilisateur n'a pas été trouvé, on retourne null
  if (!user) return null;

  const isCorrectPassword = await bcrypt.compare(password, user.hashedPassword);

  if (!isCorrectPassword) return null;

  return { id: user.id, email };
};

// export const register = async ({ email, password }: LoginForm) => {
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = await prisma.user.create({
//     data: { email: email, hashedPassword: hashedPassword },
//   });

//   return { id: user.id, email };
// };

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "Giftss_session",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 15,
    httpOnly: true,
  },
});

// récupère la session utilisateur depuis la requête http
export const getUserSession = async (request: Request) => {
  return storage.getSession(request.headers.get("Cookie"));
};

export const getUserId = async (request: Request) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
};

export const requireUserId = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
};

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

// get user from db from cookie of request
export const getUser = async (request: Request) => {
  const userId = await getUserId(request);
  if (typeof userId !== "string") return null;

  try {
    const user = prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
};

export const logout = async (request: Request, redirectTo: string = "/") => {
  const session = await getUserSession(request);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
};

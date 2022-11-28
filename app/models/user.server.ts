import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getManyUsersByEmails(emails: User["email"][]) {
  return prisma.user.findMany({ where: { email: { in: emails } } });
}

export async function getManyUsersByEmailContains(emailpart: User["email"]) {
  return prisma.user.findMany({ where: { email: { contains: emailpart } } });
}

export async function createUser(
  email: User["email"],
  password: string,
  name: User["name"]
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      hashedPassword: hashedPassword,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  hashedPassword: User["hashedPassword"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
  });

  if (!userWithPassword || !userWithPassword.hashedPassword) {
    return null;
  }

  const isValid = await bcrypt.compare(
    hashedPassword,
    userWithPassword.hashedPassword
  );

  if (!isValid) {
    return null;
  }

  const { hashedPassword: _password, ...userWithoutPassword } =
    userWithPassword;

  return userWithoutPassword;
}

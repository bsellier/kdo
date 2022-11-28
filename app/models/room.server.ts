import { Gift, Room, User } from "@prisma/client";
import { redirect } from "@remix-run/server-runtime";

import { prisma } from "~/db.server";

export async function createRoom(
  name: Room["name"],
  users: User[],
  type: Room["type"]
) {
  return await prisma.room.create({
    data: {
      name: name,
      type: type,
      users: {
        connect: users.map((user) => ({ id: user.id })),
      },
    },
  });
}

export async function addUserToRoom(roomId: Room["id"], userId: User["id"]) {
  return await prisma.room.update({
    where: { id: roomId },
    data: {
      users: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function addGiftToRoom(
  roomId: Room["id"],
  userId: User["id"],
  targetId: User["id"],
  giftIdea: Gift["name"]
) {
  return await prisma.room.update({
    where: { id: roomId },
    data: {
      gifts: {
        create: {
          name: giftIdea,
          author: { connect: { id: userId } },
          target: { connect: { id: targetId } },
        },
      },
    },
  });
}

export async function getRoomById(roomdId: Room["id"]) {
  return prisma.room.findUnique({
    where: { id: roomdId },
    select: { name: true, id: true, users: true, gifts: true },
  });
}

export async function getRoomByUserId(userId: Room["id"]) {
  return await prisma.room.findMany({
    where: { users: { some: { id: userId } } },
  });
}

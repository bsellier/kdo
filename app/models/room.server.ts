import type { Gift, Room, User } from "@prisma/client";
import { redirect } from "@remix-run/server-runtime";

import { prisma } from "~/db.server";

export async function createRoom(
  name: Room["name"],
  users: User[],
  type: Room["type"]
) {
  try {
    return await prisma.room.create({
      data: {
        name: name,
        type: type,
        users: {
          connect: users.map((user) => ({ id: user.id })),
        },
      },
    });
  } catch (error) {
    console.log("room creation error: ");
    console.log(error);
  }
}

export async function addUserToRoom(roomId: Room["id"], userId: User["id"]) {
  try {
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
  } catch (error) {
    console.log("add user to room error");
    console.log(error);
  }
}

export async function addGiftToRoom(
  roomId: Room["id"],
  userId: User["id"],
  targetId: User["id"],
  giftIdea: Gift["name"]
) {
  try {
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
  } catch (error) {
    console.log("Add gift to room error:");
    console.log(error);
  }
}

export async function getRoomById(roomdId: Room["id"]) {
  try {
    return prisma.room.findUnique({
      where: { id: roomdId },
      select: { name: true, id: true, users: true, gifts: true },
    });
  } catch (error) {
    console.log("get room by id");
    console.log(error);
  }
}

export async function getRoomByUserId(userId: Room["id"]) {
  try {
    return await prisma.room.findMany({
      where: { users: { some: { id: userId } } },
    });
  } catch (error) {
    console.log("get room by user id error");
    console.log(error);
  }
}

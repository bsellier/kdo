import type { Gift, User } from "@prisma/client";
import { prisma } from "~/db.server";

export const createGift = (
  name: Gift["name"],
  authorId: User["id"],
  targetId: User["id"]
) => {
  // prisma.gift.create({data: {
  //     name: name,
  //     // author: { connect: authorId },
  //     // target: { connect: targetId }
  // }})
};

export const updateGiftBoughtState = async (
  giftId: Gift["id"],
  bought: Gift["bought"],
  buyerId: Gift["buyerId"]
) => {
  return await prisma.gift.update({
    where: { id: giftId },
    data: {
      bought: bought,
      buyer: { connect: {id: buyerId ?? undefined}}
    },
  });
};

export const deleteGift = async (giftId: Gift["id"]) => {
  return await prisma.gift.delete({ where: { id: giftId } });
};

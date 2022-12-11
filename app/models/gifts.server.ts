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
  try {
    return await prisma.gift.update({
      where: { id: giftId },
      data: {
        bought: bought,
        buyer: { connect: { id: buyerId ?? undefined } },
      },
    });
  } catch (error) {
    console.log("update gift");
    console.log(error);
  }
};

export const deleteGift = async (giftId: Gift["id"]) => {
  try {
    return await prisma.gift.delete({ where: { id: giftId } });
  } catch (error) {
    console.log("Delete Gift error: ");
    console.log(error);
  }
};

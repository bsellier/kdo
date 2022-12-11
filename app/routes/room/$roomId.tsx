import type { User } from "@prisma/client";
import { useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { deleteGift, updateGiftBoughtState } from "~/models/gifts.server";
import {
  addGiftToRoom,
  addUserToRoom,
  getRoomById,
} from "~/models/room.server";
import { getUserByEmail } from "~/models/user.server";
import { getUser, logout } from "~/session.server";

type LoaderDataType = {
  room: Awaited<ReturnType<typeof getRoomById>>;
  user: Awaited<ReturnType<typeof getUser>>;
  otherUsers: Array<User>;
  error?: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { roomId } = params;
  if (!roomId) return { error: "Bad Request, no id found" };

  const room = await getRoomById(roomId);
  if (!room || room === null) return json({ error: "Room not found" });

  const user = await getUser(request);
  if (user === null) return logout(request);

  const usersIdList = room.users.map((mappedUser) => mappedUser.id);

  if (usersIdList.includes(user.id)) {
    const otherUsers = room.users.filter(
      (filteredUser) => filteredUser.id !== user.id
    );
    const data: LoaderDataType = {
      room,
      user,
      otherUsers,
    };
    return json(data);
  } else return { error: "401 not authorized" };
};

type ActionDataType = {
  addUserError?: string;
  addUserAchieved?: string;
  giftAdded?: boolean;
  giftBought?: boolean;
  boughtCanceled?: boolean;
  giftDeleted?: boolean;
};

export const action: ActionFunction = async ({ request, params }) => {
  const { roomId } = params;
  if (!roomId) return { error: "Bad Request, no id found" };

  const formData = await request.formData();
  const submitValue = formData.get("_submit");

  switch (submitValue) {
    case "addWishedGift": {
      const wishedGift = formData.get("wishedGift");

      if (wishedGift === null || typeof wishedGift !== "string")
        return { error: "bad request" };

      const user = await getUser(request);
      if (user === null) return logout(request);

      addGiftToRoom(roomId, user.id, user.id, wishedGift);
      return { giftAdded: true };
    }

    case "addUser": {
      const userEmail = formData.get("addUser");
      if (userEmail === null || typeof userEmail !== "string")
        return { addUserError: "Bad Request" };

      const user = await getUserByEmail(userEmail);
      if (user === null) return { addUserError: "Utilisateur non trouvé" };

      addUserToRoom(roomId, user.id);
      return { addUserAchieved: "Utilisateur ajouté" };
    }

    case "buyGift": {
      const giftId = formData.get("giftId");
      const user = await getUser(request);

      if (giftId === null || typeof giftId !== "string" || user === null)
        return { error: "badRequest" };
      updateGiftBoughtState(giftId, true, user.id);
      return { giftBought: true };
    }

    case "cancelBuy": {
      const giftId = formData.get("giftId");
      const user = await getUser(request);

      if (giftId === null || typeof giftId !== "string" || user === null)
        return { error: "badRequest" };
      updateGiftBoughtState(giftId, false, user.id);
      return { boughtCanceled: false };
    }

    case "deleteGift": {
      const giftId = formData.get("giftId");

      if (giftId === null || typeof giftId !== "string")
        return { error: "badRequest" };
      deleteGift(giftId);
      return { giftDeleted: false };
    }
  }
  return { error: "not implemented" };
};

const RoomdId = () => {
  const loaderData = useLoaderData<LoaderDataType>();
  const actionData = useActionData<ActionDataType>();

  return (
    <div>
      <form
        action="/logout"
        method="post"
        style={{ position: "absolute", right: 50, top: 25 }}
      >
        <button type="submit" className="button">
          Se déconnecter
        </button>
      </form>

      {loaderData.room === null || loaderData.error ? (
        <p style={{ color: "red" }}>{loaderData.error}</p>
      ) : (
        <div>
          <h3>Bienvenue dans le salon {loaderData.room?.name}</h3>

          <h3>Liste des cadeaux souhaités</h3>
          <div style={{ display: "flex", gap: "15px" }}>
            {loaderData.otherUsers.map((otherUser) => (
              // <div style={{ border: "solid 2px grey" }}>
              <fieldset key={otherUser.id}>
                <legend>
                  <h4>{otherUser.name}</h4>
                </legend>
                <ul>
                  {loaderData.room?.gifts
                    .filter((gift) => gift.targetId === otherUser.id)
                    .map((gift, index) => {
                      return (
                        <li key={index}>
                          <span style={{ display: "flex" }}>
                            {gift.name}
                            {gift.bought ? (
                              <>
                                {gift.buyerId === loaderData.user!.id ? (
                                  <form method="post">
                                    <input
                                      type="hidden"
                                      value={gift.id}
                                      name="giftId"
                                    />
                                    <button
                                      type="submit"
                                      name="_submit"
                                      value="cancelBuy"
                                    >
                                      Annuler
                                    </button>
                                  </form>
                                ) : (
                                  <span
                                    style={{
                                      marginLeft: "5px",
                                      lineHeight: "1.8em",
                                      fontStyle: "italic",
                                      fontWeight: "bold",
                                      fontSize: "0.85em",
                                    }}
                                  >
                                    Acheté
                                  </span>
                                )}
                              </>
                            ) : (
                              <form method="post">
                                <input
                                  type="hidden"
                                  value={gift.id}
                                  name="giftId"
                                />
                                <button
                                  type="submit"
                                  name="_submit"
                                  value="buyGift"
                                >
                                  Marquer comme acheté
                                </button>
                              </form>
                            )}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </fieldset>
              // </div>
            ))}

            <fieldset>
              <legend>
                <h4>Mes idées cadeaux</h4>
              </legend>
              <ul>
                {loaderData.room?.gifts
                  .filter((gift) => gift.targetId === loaderData.user!.id)
                  .map((gift) => (
                    <li key={gift.id}>
                      <span
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "5px",
                        }}
                      >
                        {gift.name}
                        <form method="post">
                          <input type="hidden" name="giftId" value={gift.id} />
                          <button
                            type="submit"
                            name="_submit"
                            value="deleteGift"
                          >
                            Supprimer
                          </button>
                        </form>
                      </span>
                    </li>
                  ))}
              </ul>
            </fieldset>
          </div>
          <h3>Ajouter un cadeau en souhait</h3>
          <form method="post">
            <input type="text" name="wishedGift" />
            <button type="submit" name="_submit" value="addWishedGift">
              Ajouter
            </button>
          </form>

          <h3>Ajouter un utilisateur</h3>
          <form method="post">
            <input type="text" name="addUser" />
            <button type="submit" name="_submit" value="addUser">
              Chercher
            </button>
            <p style={{ color: "red" }}>{actionData?.addUserError}</p>
            <p style={{ color: "green" }}>{actionData?.addUserAchieved}</p>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoomdId;

import { useActionData } from "@remix-run/react";
import type { ActionFunction} from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import type { RoomType, User } from "@prisma/client";
import {
  getManyUsersByEmailContains,
  getManyUsersByEmails,
  getUserById,
} from "~/models/user.server";
import { createRoom } from "~/models/room.server";
import { getUser, logout } from "~/session.server";

type ActionReturnType = {
  error?: string;
  usersEmail?: string[];
};

export const action: ActionFunction = async ({
  request,
}): Promise<ActionReturnType | Response> => {
  const user = await getUser(request);
  if (user === null) return logout(request);

  const formData = await request.formData();
  const _action = formData.get("_action");
  switch (_action) {
    case "searchEmails":
      const searchEmails = formData.get("searchUser");

      console.log(searchEmails);

      if (searchEmails && typeof searchEmails === "string") {
        const users = await getManyUsersByEmailContains(searchEmails);
        const usersEmail = users.map((user) => user.email);
        return { usersEmail: usersEmail };
      } else return { error: "Empty search user field" };

    case "createRoom":
      console.log("create room");
      const roomName = formData.get("roomName");
      const roomType = formData.get("roomType");
      const chooseUsers = formData.getAll("chooseUsers");

      if (
        !roomName ||
        typeof roomName !== "string" ||
        !roomType ||
        typeof roomType !== "string" ||
        !["SingleTarget", "MultiTarget", "AllTarget"].includes(roomType) ||
        !chooseUsers
      ) {
        return { error: "one or more field missing, please try again" };
      }

      const roomCreator = await getUserById(user.id);
      if (roomCreator === null) return { error: "vous n'existez pas" };
      const roomUsers: User[] = [roomCreator];

      const users = await getManyUsersByEmails(chooseUsers as string[]);
      if (users) roomUsers.push(...users);
      else return { error: "users not found" };

      const newRoom = await createRoom(
        roomName,
        roomUsers,
        roomType as RoomType
      );

      return redirect(`${newRoom.id}`);
  }

  return { error: "Implementation does not exist" };
};

const CreateRoom = () => {
  const actionData = useActionData() as ActionReturnType;
  return (
    <div>
      <form method="post">
        <label>
          Name
          <input type="text" required name="roomName" />
        </label>
        <label>
          Type
          <select name="roomType">
            <option value="SingleTarget">Anniversaire</option>
            <option value="AllTarget">Noël</option>
          </select>
        </label>
        {actionData?.usersEmail && (
          <label>
            Select user
            <select name="chooseUsers" multiple>
              {actionData.usersEmail.map((user: string) => (
                <option key={user}>{user}</option>
              ))}
            </select>
          </label>
        )}

        <button type="submit" name="_action" value="createRoom">
          Créer
        </button>
      </form>
      Ajouter un utilisateur (par mail)
      <form method="post">
        <input type="text" name="searchUser" />
        <button type="submit" name="_action" value="searchEmails">
          Chercher
        </button>
      </form>
      {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
    </div>
  );
};

export default CreateRoom;

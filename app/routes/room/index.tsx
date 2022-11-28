import { Room } from "@prisma/client";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";
import { getRoomByUserId } from "~/models/room.server";
import { getUser, logout } from "~/session.server";

type DataType = {
  rooms: Room[];
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  if (user === null) return logout(request);

  const rooms = await getRoomByUserId(user.id);

  const data = { rooms: rooms };

  return data;
};

const RoomIndex = () => {
  const data = useLoaderData<DataType>();

  return (
    <div>
      RoomIndex
      <ul>
        <div>
          {data.rooms.map((room, index) => (
            <li key={index}>
              <Link to={room.id}>{room.name}</Link>
            </li>
          ))}
        </div>
      </ul>
    </div>
  );
};

export default RoomIndex;

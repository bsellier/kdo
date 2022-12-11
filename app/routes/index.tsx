import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { getUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const data: { user: Awaited<ReturnType<typeof getUser>> } = { user };

  return json(data);
};

export default function Index() {
  const data = useLoaderData<{ user: Awaited<ReturnType<typeof getUser>> }>();
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">
          Accueil
        </Link>

        <ul className="nav">
          {data && data.user ? (
            // Si on est connecté
            <>
              <li>
                <Link to="/room">Rooms</Link>
              </li>
              <li>
                <Link to="/room/new">Create room</Link>
              </li>
              <li>
                <form action="/logout" method="post">
                  <button type="submit" className="button">
                    Logout
                  </button>
                </form>
              </li>
            </>
          ) : (
            // Si on est pas connecté
            <>
              <li>
                <Link to="/login">Se connecter</Link>
              </li>
              <li>
                <Link to="/register">Créer un compte</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="container">
        Votre application
        <Outlet />
      </div>
    </>
  );
}

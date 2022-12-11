import {
  LiveReload,
  Outlet,
  Links,
  Meta,
  ScrollRestoration,
} from "@remix-run/react";
import type { MetaFunction } from "@remix-run/server-runtime";

// export const links: LinksFunction = () => [
//   { rel: "stylesheet", href: globalStyleUrl },
// ];

export const meta: MetaFunction = () => {
  return {
    description: "A cool blog",
    keywords: "remix, cool, blog",
  };
};

export default function App() {
  const title: string = "Giiiftss";
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>{title}</title>
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        {/* <Scripts /> */}
        {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
      </body>
    </html>
  );
}

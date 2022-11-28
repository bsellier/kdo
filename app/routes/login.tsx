import { useActionData, useSearchParams } from "@remix-run/react";
import { ActionFunction, json } from "@remix-run/server-runtime";
import { login, createUserSession } from "~/session.server";

const validateUrl = (url: unknown): string => {
  console.log(url);
  let urls = ["/"];
  if (typeof url === "string" && urls.includes(url)) {
    return url;
  }
  return "/";
};

const badRequest = (message: string) => {
  console.log(message);
  return json(message, { status: 400 });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = await form.get("email");
  const password = await form.get("password");
  const redirectUrl = validateUrl(form.get("redirectTo"));

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof redirectUrl !== "string"
  ) {
    return badRequest("Le formulaire n'a pas été envoyé correctement");
  }

  const user = await login({ email, password });
  console.log(user);
  if (!user) {
    return badRequest("Email ou mot de passe incorrect");
  }

  return createUserSession(user.id, redirectUrl);
};

const Login = () => {
  // Get URL to redirect after login
  const [searchParams] = useSearchParams();
  const actionData = useActionData();

  return (
    <div
      className="loginContainer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: "95%",
        alignItems: "center",
      }}
    >
      <h1>Login</h1>

      <form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "95%",
          alignItems: "center",
        }}
      >
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? undefined}
        />

        <label>
          Votre adresse-email <br />
          <input type="text" name="email" />
        </label>

        <label>
          Votre mot de passe
          <br />
          <input type="password" name="password" />
        </label>
        <button type="submit">Se connecter</button>

        {actionData?.message ? <p role="alert">actionData.message</p> : null}
      </form>
    </div>
  );
};

export default Login;

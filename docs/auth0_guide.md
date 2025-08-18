## Auth0 Login Implementation Guide (from this project)

This guide explains how Auth0 login is implemented in this repository and how to reproduce the setup in another Next.js project.

### Architecture Overview
- **Library**: `@auth0/nextjs-auth0` (server SDK).
- **Core object**: An `Auth0Client` instance in `lib/auth0.ts` that centralizes configuration (domain, client ID/secret, base URL, audience, scopes).
- **Routing**: Next.js `middleware.ts` delegates any request under `/auth/*` to the Auth0 SDK and protects all other routes by checking for a valid session.
- **Login UI**: No custom page; uses Auth0 Hosted Universal Login. Visiting `/auth/login` redirects to Auth0.
- **Session**: Retrieved server-side via `auth0.getSession(request?)`. Access token available at `session.accessToken` (if configured with an API/audience).

### Key Files and Responsibilities
```1:14:lib/auth0.ts
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET,
  appBaseUrl: process.env.NEXT_PUBLIC_AUTH0_BASE_URL,
  secret: process.env.NEXT_PUBLIC_AUTH0_SECRET,

  authorizationParameters: {
    scope: "openid profile email read:shows",
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
  }
});
```

```1:21:middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function middleware(request: NextRequest) {
  const authRes = await auth0.middleware(request);

  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  const session = await auth0.getSession(request);

  if (!session) {
    return NextResponse.redirect(
      new URL("/auth/login", request.nextUrl.origin)
    );
  }

  return authRes;
}
```

```1:22:app/api/user/route.ts
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

// Force dynamic rendering since this route uses cookies for authentication
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user || !session.user.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ userId: session.user.sub });
  } catch (error) {
    console.error("Error fetching user session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

### Route Behavior
- `GET /auth/login`: Redirects to Auth0 Universal Login.
- `GET /auth/callback`: Handled by SDK; processes the authorization response, creates session cookies.
- `GET /auth/logout`: Logs out locally and optionally at Auth0, then redirects back.
- Any other route: Checked for an active session; if missing, redirected to `/auth/login`.

Note: The middleware’s `auth0.middleware(request)` wires the SDK handlers under the `/auth/*` prefix.

### Environment Variables (required)
Set these in your environment (e.g., `.env.local`, Vercel env vars):
- `NEXT_PUBLIC_AUTH0_DOMAIN`
- `NEXT_PUBLIC_AUTH0_CLIENT_ID`
- `NEXT_PUBLIC_AUTH0_CLIENT_SECRET`
- `NEXT_PUBLIC_AUTH0_BASE_URL` (e.g., `https://your-app.example.com`)
- `NEXT_PUBLIC_AUTH0_SECRET` (random long string for session encryption)
- `NEXT_PUBLIC_AUTH0_AUDIENCE` (required if you need an API access token)

Optional in code but configured:
- Scopes: `openid profile email read:shows` (adjust as needed)

### Auth0 Dashboard Setup (Universal Login + Google)
1. Create an Application (Regular Web App).
2. Configure Application settings:
   - Allowed Callback URLs: `https://YOUR_DOMAIN/auth/callback`
   - Allowed Logout URLs: `https://YOUR_DOMAIN/`
   - Allowed Web Origins: `https://YOUR_DOMAIN`
3. Create/Enable an API (if you need an access token in `session.accessToken`):
   - Define the API Audience and grant scopes; match `NEXT_PUBLIC_AUTH0_AUDIENCE`.
4. Enable Google login:
   - Connections → Social → Google (or Google OAuth 2)
   - Add Google Client ID/Secret from Google Cloud Console
   - Enable the connection for your Application
5. Optional: Force Google on login:
   - Use `/auth/login?connection=google-oauth2`

### How to Use the Session in Code
- Server route example (check auth and read user):
  ```ts
  import { auth0 } from "@/lib/auth0";
  // ...
  const session = await auth0.getSession();
  if (!session) { /* return 401 */ }
  const user = session.user; // contains sub, email, name, etc.
  ```
- Access token retrieval:
  ```ts
  import { auth0 } from "@/lib/auth0";
  const session = await auth0.getSession();
  const accessToken = session?.accessToken; // if API audience configured
  ```
- Centralized utility in this repo:
  ```1:17:lib/auth-utils.ts
  import { auth0 } from "./auth0";

  export async function getAccessToken(): Promise<string | undefined> {
    try {
      const session = await auth0.getSession();
      const accessToken = session?.accessToken as string | undefined;
      return accessToken;
    } catch {
      return undefined;
    }
  }
  ```

### Protecting Pages and APIs
- Global protection is done in `middleware.ts`:
  - All non-`/auth/*` routes require a session.
- For API routes that use cookies (`app/api/...`), explicitly read the session to gate access, as shown in `app/api/user/route.ts`.

### Login, Logout, and Forgot Password
- Login: Redirect users to `/auth/login` (or `/auth/login?connection=google-oauth2` to force Google).
- Logout: Link to `/auth/logout`. Example in the UI:
  ```70:100:app/components/page-with-sidebar.tsx
  <DropdownMenuItem onClick={() => (window.location.href = "/auth/logout")} className="cursor-pointer">
    <span>Logout</span>
  </DropdownMenuItem>
  ```
- Forgot Password:
  - Use Hosted Universal Login with a screen hint:
    - `/auth/login?screen_hint=reset_password`
  - Note: If you copy code, standardize on the `/auth/*` prefix (this repo has one instance of `/api/auth/login?screen_hint=reset_password` in `app/auth/forgot-password/page.tsx` that should be updated to `/auth/login?screen_hint=reset_password` to match the rest).

### Reproducing This Setup in Another Next.js App
1. Install dependency:
   - `@auth0/nextjs-auth0`
2. Create `lib/auth0.ts` and instantiate `Auth0Client` with your env variables.
3. Add `middleware.ts` to:
   - Delegate `/auth/*` to the SDK
   - Redirect unauthenticated requests to `/auth/login`
4. Configure Auth0 Application settings (callbacks, logout URLs, allowed origins).
5. Enable your connections (e.g., Google) as needed.
6. In server code, read the session via `auth0.getSession()` and gate your APIs.
7. Link your UI to `/auth/login` and `/auth/logout`.
8. If you need API access tokens, set `audience` and requested `scope` in `lib/auth0.ts` and the corresponding API/scopes in Auth0 Dashboard.

### Local Development Tips
- Set `NEXT_PUBLIC_AUTH0_BASE_URL` to your local URL (e.g., `http://localhost:3000`).
- Add local callback/logout URLs in your Auth0 Application settings:
  - Callback: `http://localhost:3000/auth/callback`
  - Logout: `http://localhost:3000/`
  - Web Origin: `http://localhost:3000`
- Use `screen_hint=signup` or `screen_hint=reset_password` for testing various hosted screens:
  - `http://localhost:3000/auth/login?screen_hint=signup`
  - `http://localhost:3000/auth/login?screen_hint=reset_password`

### Troubleshooting and Gotchas
- Ensure the route prefix is consistent. This repo uses `/auth/*` via middleware. If you use the SDK defaults (`/api/auth/*`), align middleware, links, and Auth0 allowed URLs accordingly.
- If `session.accessToken` is empty:
  - Verify `audience` in `lib/auth0.ts` matches an Auth0 API that’s enabled for your Application.
  - Confirm the API grants the scopes you request.
- Make sure `NEXT_PUBLIC_AUTH0_SECRET` is a strong random value; changing it invalidates sessions.
- If you see redirect loops, check:
  - Allowed Callback URLs
  - Allowed Web Origins
  - Base URL environment variable

### Minimal Checklist to Copy
- Create `lib/auth0.ts` with your Auth0 tenant config.
- Add `middleware.ts` to handle `/auth/*` and protect routes.
- Set env vars (`NEXT_PUBLIC_AUTH0_*`).
- Configure Auth0 Application (callbacks, logout, origins).
- Optionally configure an API and set `audience`/scopes.
- Use `/auth/login` and `/auth/logout` in the UI.
- Gate server routes with `auth0.getSession()`.

- Summary
  - Centralizes Auth0 via `lib/auth0.ts` and protects routes in `middleware.ts`.
  - Uses Auth0 Hosted Universal Login at `/auth/login`; no custom login page is implemented.
  - Sessions are read server-side with `auth0.getSession()`, optional access token via configured API audience.
  - To enable Google: enable the Google connection in Auth0, update allowed URLs, and optionally force connection via `?connection=google-oauth2`.
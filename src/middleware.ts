import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/guru", "/admin", "/siswa"];

const roleToRoute = {
  ADMIN: "admin",
  GURU: "guru",
  SISWA: "siswa",
  admin: "admin",
  guru: "guru",
  siswa: "siswa",
};

const roleDashboards = {
  ADMIN: "/admin/dashboard",
  GURU: "/guru/dashboard",
  SISWA: "/siswa/dashboard",
  admin: "/admin/dashboard",
  guru: "/guru/dashboard",
  siswa: "/siswa/dashboard",
};

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  const sessionCookie = getSessionCookie(request);
  const isLoggedIn = !!sessionCookie;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Pathname:", pathname);
  console.log("Session cookie exists:", isLoggedIn);

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  // Belum login tapi akses protected route
  if (protectedRoutes.includes(`/${firstSegment}`) && !isLoggedIn) {
    console.log("Not logged in, redirecting to login page");
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isLoggedIn) {
    try {
      const sessionResponse = await fetch(
        new URL("/api/auth/get-session", request.url),
        {
          headers: { cookie: request.headers.get("cookie") || "" },
        }
      );

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        const userRole = sessionData?.user?.role;

        console.log("User role:", userRole);
        console.log("Session data:", sessionData);

        // Redirect dari login page ke dashboard
        if (pathname === "/") {
          if (
            userRole &&
            roleDashboards[userRole as keyof typeof roleDashboards]
          ) {
            console.log(
              "Redirecting to dashboard:",
              roleDashboards[userRole as keyof typeof roleDashboards]
            );
            return NextResponse.redirect(
              new URL(
                roleDashboards[userRole as keyof typeof roleDashboards],
                request.url
              )
            );
          } else {
            console.log("No valid role found, stay on login page");
            return NextResponse.next();
          }
        }

        // Cek akses role-based routes - CUMA CEK ROLE, GAK CEK SUB-PATH
        if (userRole) {
          const userRoutePrefix =
            roleToRoute[userRole as keyof typeof roleToRoute];

          // Jika user akses route protected tapi salah role (misal SISWA akses /admin)
          if (
            protectedRoutes.includes(`/${firstSegment}`) &&
            firstSegment !== userRoutePrefix
          ) {
            console.log(
              "Wrong role access, redirecting to dashboard:",
              roleDashboards[userRole as keyof typeof roleDashboards]
            );
            return NextResponse.redirect(
              new URL(
                roleDashboards[userRole as keyof typeof roleDashboards],
                request.url
              )
            );
          }
        }
      } else {
        console.log("Session API response not ok:", sessionResponse.status);
        if (pathname !== "/") {
          console.log("Redirecting to login page due to invalid session");
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      return NextResponse.next();
    }
  }

  console.log("========================");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/guru", "/admin", "/siswa"];

// Mapping untuk check route access (lowercase untuk URL)
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
  // Fallback untuk lowercase
  admin: "/admin/dashboard",
  guru: "/guru/dashboard",
  siswa: "/siswa/dashboard",
};

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Cek session cookie dulu
  const sessionCookie = getSessionCookie(request);
  const isLoggedIn = !!sessionCookie;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Pathname:", pathname);
  console.log("Session cookie exists:", isLoggedIn);

  // Jika user belum login dan mengakses protected routes
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !isLoggedIn
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Jika user sudah login
  if (isLoggedIn) {
    try {
      // Fetch session data untuk mendapatkan role
      const sessionResponse = await fetch(
        new URL("/api/auth/get-session", request.url),
        {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        const userRole = sessionData?.user?.role;

        console.log("User role:", userRole);
        console.log("Session data:", sessionData);

        // Jika user mengakses root path "/" (login page)
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
            console.log("No valid role found for user, role:", userRole);
            // Jika tidak ada role yang valid, redirect ke halaman umum atau tetap di login
            return NextResponse.next();
          }
        }

        // Cek akses role-based routes
        if (userRole) {
          const userRoutePrefix =
            roleToRoute[userRole as keyof typeof roleToRoute];

          // Jika user mencoba akses route yang tidak sesuai dengan rolenya
          const isAccessingWrongRole = protectedRoutes.some((route) => {
            if (pathname.startsWith(route)) {
              // Cek apakah route ini bukan milik role user
              return !pathname.startsWith(`/${userRoutePrefix}`);
            }
            return false;
          });

          if (isAccessingWrongRole) {
            console.log(
              "Wrong role access, redirecting to:",
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
        // Jika API gagal tapi ada session cookie, kemungkinan session expired
        if (pathname === "/") {
          // Jika sudah di login page, biarkan saja
          return NextResponse.next();
        } else {
          // Jika akses route lain tapi session invalid, redirect ke login
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      // Jika error, tapi masih ada session cookie, mungkin network issue
      // Untuk sementara biarkan request lanjut
      return NextResponse.next();
    }
  }

  console.log("========================");
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

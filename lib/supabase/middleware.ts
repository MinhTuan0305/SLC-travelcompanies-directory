// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

// Chỉ định middleware chạy trên Node runtime (không dùng Edge)
export const config = {
  runtime: "nodejs",
};

export async function updateSession(request: NextRequest) {
  // Khởi tạo response mặc định
  let supabaseResponse = NextResponse.next({ request });

  // Nếu chưa setup env vars, skip check
  if (!hasEnvVars) return supabaseResponse;

  // Tạo client Supabase mới cho mỗi request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Cập nhật cookies vào request
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          // Khởi tạo lại response và set cookies vào response
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Lấy claims của user
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Nếu không có user và không phải trang login/auth, redirect về login
  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Trả về response mặc định
  return supabaseResponse;
}

import { NextRequest, NextResponse } from "next/server";

import { handleLinkedInCallback } from "@/actions/auth/login";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const isPostingAuth =
    request.cookies.get("linkedin_oauth_intent")?.value === "linkedin_posting";

  if (error) {
    if (isPostingAuth) {
      return NextResponse.redirect(
        new URL(
          `/dash/settings?linkedin=error&message=${encodeURIComponent(error)}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    if (isPostingAuth) {
      return NextResponse.redirect(
        new URL(
          "/dash/settings?linkedin=error&message=missing_params",
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL("/auth?error=missing_params", request.url)
    );
  }

  let redirectPath = "/dash";
  let postingEnabled = false;

  try {
    const result = await handleLinkedInCallback(code, state);
    redirectPath = result.redirectPath;
    postingEnabled = result.user.linkedinPostingEnabled ?? false;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    if (isPostingAuth) {
      return NextResponse.redirect(
        new URL(
          `/dash/settings?linkedin=error&message=${encodeURIComponent(message)}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(message)}`, request.url)
    );
  }

  if (redirectPath === "/dash/settings") {
    if (!postingEnabled) {
      return NextResponse.redirect(
        new URL(
          "/dash/settings?linkedin=error&message=LinkedIn%20posting%20access%20was%20not%20enabled",
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL("/dash/settings?linkedin=success", request.url)
    );
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}

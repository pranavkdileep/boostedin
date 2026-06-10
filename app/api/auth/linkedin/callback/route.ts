import { NextRequest, NextResponse } from "next/server";

import { handleLinkedInCallback } from "@/actions/auth/login";
import { getPublicOrigin } from "@/lib/http/publicOrigin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publicOrigin = getPublicOrigin(request.headers);
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
          publicOrigin
        )
      );
    }

    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error)}`, publicOrigin)
    );
  }

  if (!code || !state) {
    if (isPostingAuth) {
      return NextResponse.redirect(
        new URL(
          "/dash/settings?linkedin=error&message=missing_params",
          publicOrigin
        )
      );
    }

    return NextResponse.redirect(
      new URL("/auth?error=missing_params", publicOrigin)
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
          publicOrigin
        )
      );
    }

    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(message)}`, publicOrigin)
    );
  }

  if (redirectPath === "/dash/settings") {
    if (!postingEnabled) {
      return NextResponse.redirect(
        new URL(
          "/dash/settings?linkedin=error&message=LinkedIn%20posting%20access%20was%20not%20enabled",
          publicOrigin
        )
      );
    }

    return NextResponse.redirect(
      new URL("/dash/settings?linkedin=success", publicOrigin)
    );
  }

  return NextResponse.redirect(new URL(redirectPath, publicOrigin));
}

"use server";

const LINKEDIN_VERSION = "202603";

interface PublishResult {
  linkedinPostId: string;
  linkedinPostUrl: string;
}

type FetchFn = typeof globalThis.fetch;

export async function publishToLinkedin(
  commentary: string,
  coverImageUrl: string | undefined,
  accessToken: string,
  fetchFn: FetchFn = globalThis.fetch
): Promise<PublishResult> {
  const authorUrn = await getAuthorUrn(accessToken, fetchFn);
  const sanitized = sanitizeCommentary(commentary);

  let thumbnailUrn: string | null = null;
  if (coverImageUrl) {
    thumbnailUrn = await uploadCoverImage(coverImageUrl, authorUrn, accessToken, fetchFn);
  }

  const body: Record<string, unknown> = {
    author: authorUrn,
    commentary: sanitized,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };

  if (thumbnailUrn) {
    body.content = {
      media: {
        id: thumbnailUrn,
      },
    };
  }

  const response = await fetchFn("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: linkedinHeaders(accessToken),
    body: JSON.stringify(body),
  });

  const responseBody = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(
      formatApiError("Post creation failed", response, responseBody)
    );
  }

  const linkedinPostId = response.headers.get("x-restli-id");
  if (!linkedinPostId) {
    throw new Error(
      "LinkedIn did not return a post ID (x-restli-id header missing)"
    );
  }

  return {
    linkedinPostId,
    linkedinPostUrl: `https://www.linkedin.com/feed/update/${linkedinPostId}`,
  };
}

async function getAuthorUrn(
  accessToken: string,
  fetchFn: FetchFn
): Promise<string> {
  const response = await fetchFn("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const body = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(
      formatApiError(
        "Could not resolve LinkedIn author from token",
        response,
        body
      )
    );
  }

  const data = body as Record<string, unknown> | null;

  if (!data?.sub || typeof data.sub !== "string") {
    throw new Error(
      "LinkedIn userinfo response did not include sub field"
    );
  }

  return `urn:li:person:${data.sub}`;
}

function sanitizeCommentary(text: string): string {
  return text
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,
      ""
    )
    .replace(/\(/g, "（")
    .replace(/\)/g, "）")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function uploadCoverImage(
  imageUrl: string,
  ownerUrn: string,
  accessToken: string,
  fetchFn: FetchFn
): Promise<string> {
  const initResponse = (await linkedinJson(
    "https://api.linkedin.com/rest/images?action=initializeUpload",
    {
      method: "POST",
      accessToken,
      body: {
        initializeUploadRequest: {
          owner: ownerUrn,
        },
      },
    },
    fetchFn
  )) as Record<string, unknown>;

  const value = initResponse?.value as
    | Record<string, unknown>
    | undefined;
  const uploadUrl = value?.uploadUrl as string | undefined;
  const imageUrn = value?.image as string | undefined;

  if (!uploadUrl || !imageUrn) {
    throw new Error(
      `Image upload initialization did not return uploadUrl/image: ${JSON.stringify(initResponse)}`
    );
  }

  const imageResponse = await fetchFn(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(
      `Failed to download cover image from ${imageUrl}: ${imageResponse.status}`
    );
  }

  const imageBytes = await imageResponse.arrayBuffer();
  const contentType =
    imageResponse.headers.get("content-type") || "application/octet-stream";

  const uploadResponse = await fetchFn(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: imageBytes,
  });

  const uploadBody = await parseResponseBody(uploadResponse);
  if (!uploadResponse.ok) {
    throw new Error(
      formatApiError("Image upload failed", uploadResponse, uploadBody)
    );
  }

  return imageUrn;
}

async function linkedinJson(
  url: string,
  {
    method = "GET",
    accessToken,
    body,
  }: { method?: string; accessToken: string; body?: unknown },
  fetchFn: FetchFn
): Promise<unknown> {
  const response = await fetchFn(url, {
    method,
    headers: linkedinHeaders(accessToken),
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseBody = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(
      formatApiError(`${method} ${url} failed`, response, responseBody)
    );
  }

  return responseBody;
}

function linkedinHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Linkedin-Version": LINKEDIN_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  };
}

async function parseResponseBody(
  response: Response
): Promise<unknown | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatApiError(
  prefix: string,
  response: Response,
  body: unknown
): string {
  return `${prefix}. Status ${response.status} ${response.statusText}. Body: ${typeof body === "string" ? body : JSON.stringify(body)}`;
}

export function getPublicOrigin(headerList: Headers): string {
  const configuredHost = process.env.DEFAULT_HOST?.trim();

  if (!configuredHost) {
    throw new Error("DEFAULT_HOST is not defined in .env.local");
  }

  if (
    configuredHost.startsWith("http://") ||
    configuredHost.startsWith("https://")
  ) {
    return new URL(configuredHost).origin;
  }

  const forwardedProto = headerList
    .get("x-forwarded-proto")
    ?.split(",", 1)[0]
    .trim();
  const protocol =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : configuredHost.includes("localhost")
        ? "http"
        : "https";

  return `${protocol}://${configuredHost}`;
}

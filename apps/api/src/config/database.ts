import "dotenv/config";

const fallbackDatabaseUrl = "postgresql://golf:golf@localhost:5433/golf_dev";

export function getDatabaseUrl() {
  if (process.env.NODE_ENV === "production") {
    const configuredUrl = process.env.DATABASE_URL?.trim();
    if (configuredUrl) {
      return configuredUrl;
    }
  }
  console.log("Using fallback database URL:", fallbackDatabaseUrl);
  return fallbackDatabaseUrl;
}

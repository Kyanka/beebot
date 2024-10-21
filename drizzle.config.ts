import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";
export default defineConfig({
    strict: true,
    schema: './core/**/*.sql.ts',
    dialect: "postgresql",
    verbose: true,
    dbCredentials: {
      url: Resource.DatabaseUrl.value,
      ssl: 'prefer'
  }
});
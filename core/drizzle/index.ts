import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres';
import { Resource } from "sst";


const queryClient = postgres(Resource.DatabaseUrl.value);
export const db = drizzle(queryClient);
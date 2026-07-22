import type {Config} from 'drizzle-kit';

export default {
  schema: '../../packages/shared/database/src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/sessioflow',
  },
} satisfies Config;

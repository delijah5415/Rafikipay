# Prisma notes

- Canonical Prisma schema is prisma/schema.prisma.
- After pulling changes run:
  - npm install
  - npx prisma generate
  - npx prisma migrate dev --name init (if creating migrations)

- For serverless environments, instantiate Prisma client with a global cached instance to avoid exhausting connections (see src/lib/prisma.ts).

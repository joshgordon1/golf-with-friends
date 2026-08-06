Initialized Prisma in your project

  prisma/
    schema.prisma
  prisma.config.ts
  .env
  .gitignore
  .claude/skills/
  .windsurf/skills/
  .agents/skills/
  skills-lock.json

Next, choose how you want to set up your database:

CONNECT EXISTING DATABASE:
  1. Configure your DATABASE_URL in prisma.config.ts
  2. Run prisma db pull to introspect your database.

CREATE NEW DATABASE:
  Local: npx prisma dev (runs Postgres locally in your terminal)
  Cloud: npx create-db (creates a free Prisma Postgres database)

Then, define your models in prisma/schema.prisma and run prisma migrate dev to apply your schema.

Learn more: https://pris.ly/getting-started


golfcourseapi.com

For any requests you make to the Golf Course API, please include a request header in the format
`Authorization: Bearer XXXXXXX`
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing");

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: "microgravity" },
    update: {},
    create: {
      slug: "microgravity",
      title: "Microgravity 101",
      description: "Découvrir les bases de la microgravité",
      level: "Beginner",
      capsules: {
        create: [
          {
            title: "Capsule 1 — Bases",
            sortOrder: 1,
            modules: {
              create: [
                {
                  title: "Module 1 — Introduction",
                  sortOrder: 1,
                  isLocked: false,
                  chapters: {
                    create: [
                      {
                        title: "Chapitre 1 — Bienvenue",
                        sortOrder: 1,
                        mdPath: "courses/microgravity/01-welcome.md",
                        estMin: 10
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log("Seed OK course:", course.slug);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

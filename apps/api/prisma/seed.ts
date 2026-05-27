import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing");

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── On supprime d'abord le cours existant pour repartir propre ──
  // (les capsules / modules / chapitres sont supprimés en cascade)
  await prisma.course.deleteMany({ where: { slug: "microgravity" } });

  // ── Microgravity 101 ────────────────────────────────────────────
  const course = await prisma.course.create({
    data: {
      slug: "microgravity",
      title: "Microgravity 101",
      description:
        "Comprends la microgravité comme un astronaute : ses effets sur le corps, les méthodes d'entraînement et les contre-mesures essentielles.",
      level: "Beginner",
      isPremium: false,

      capsules: {
        create: [
          {
            // frontmatter.capsule : "Physiologie spatiale"
            title: "Physiologie spatiale",
            sortOrder: 1,

            modules: {
              create: [
                {
                  // frontmatter.chapter : "Introduction à l'environnement spatial"
                  title: "Introduction à l'environnement spatial",
                  sortOrder: 1,
                  isLocked: false,

                  chapters: {
                    create: [
                      {
                        // frontmatter.title du fichier module-microgravity-001.md
                        title:
                          "Module 1 — Comprendre la microgravité comme un astronaute",
                        sortOrder: 1,
                        mdPath:
                          "courses/microgravity/module-microgravity-001.md",
                        estMin: 25, // frontmatter.duration_minutes
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅ Seed OK — cours créé :", course.slug);
  console.log("   Capsule  : Physiologie spatiale");
  console.log("   Module   : Introduction à l'environnement spatial");
  console.log("   Chapitre : Module 1 — Comprendre la microgravité comme un astronaute");
  console.log("   Fichier  : courses/microgravity/module-microgravity-001.md");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

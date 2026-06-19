import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing");

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Utilisateurs demo ───────────────────────────────────────────────────────
  const password = await bcrypt.hash("demo1234", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@demo.com" },
    update: {},
    create: {
      email: "alice@demo.com",
      name: "Alice Martin",
      passwordHash: password,
      goalDaily: 30,
      goalWeekly: 5,
      goalStreak: 14,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@demo.com" },
    update: {},
    create: {
      email: "bob@demo.com",
      name: "Bob Durand",
      passwordHash: password,
      goalDaily: 20,
      goalWeekly: 3,
      goalStreak: 7,
    },
  });

  console.log(`✅ Utilisateurs: ${alice.name}, ${bob.name}`);

  // ── Récupère les cours ──────────────────────────────────────────────────────
  const courses = await prisma.course.findMany({
    include: {
      capsules: {
        include: {
          modules: {
            include: { chapters: { where: { isPublished: true }, take: 3 } },
          },
        },
      },
    },
  });

  if (courses.length === 0) {
    console.log("⚠️  Aucun cours trouvé — lance d'abord npm run db:seed");
    return;
  }

  const allChapters = courses.flatMap((c) =>
    c.capsules.flatMap((cap) =>
      cap.modules.flatMap((m) => m.chapters)
    )
  );

  // ── Inscriptions ────────────────────────────────────────────────────────────
  for (const course of courses.slice(0, 3)) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: alice.id, courseId: course.id } },
      update: {},
      create: { userId: alice.id, courseId: course.id },
    });
  }
  for (const course of courses.slice(0, 2)) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: bob.id, courseId: course.id } },
      update: {},
      create: { userId: bob.id, courseId: course.id },
    });
  }
  console.log(`✅ Inscriptions: Alice → ${Math.min(3, courses.length)} cours, Bob → ${Math.min(2, courses.length)} cours`);

  // ── Progressions ────────────────────────────────────────────────────────────
  const aliceChapters = allChapters.slice(0, 6);
  for (let i = 0; i < aliceChapters.length; i++) {
    const ch = aliceChapters[i];
    const status = i < 4 ? "COMPLETED" : "IN_PROGRESS";
    const score = i < 4 ? 100 : Math.round(40 + Math.random() * 40);
    await prisma.progress.upsert({
      where: { userId_chapterId: { userId: alice.id, chapterId: ch.id } },
      update: { status, score },
      create: { userId: alice.id, chapterId: ch.id, status, score },
    });
  }

  const bobChapters = allChapters.slice(0, 3);
  for (let i = 0; i < bobChapters.length; i++) {
    const ch = bobChapters[i];
    const status = i < 2 ? "COMPLETED" : "IN_PROGRESS";
    const score = i < 2 ? 100 : 50;
    await prisma.progress.upsert({
      where: { userId_chapterId: { userId: bob.id, chapterId: ch.id } },
      update: { status, score },
      create: { userId: bob.id, chapterId: ch.id, status, score },
    });
  }
  console.log(`✅ Progressions: Alice → ${aliceChapters.length} chapitres, Bob → ${bobChapters.length} chapitres`);

  console.log("\n🎉 Données de démo insérées !");
  console.log("   alice@demo.com  /  demo1234");
  console.log("   bob@demo.com    /  demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

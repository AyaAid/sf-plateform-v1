import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing");

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

interface CourseMeta {
  slug: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  isPremium: boolean;
}

interface ModuleFrontmatter {
  available: boolean;
  capsule: string;
  chapter: string;
  title: string;
  duration_minutes: number;
}

const contentDir = path.join(process.cwd(), "content", "courses");

async function seedCourse(courseDir: string) {
  // Read course metadata
  const metaRaw = await fs.readFile(
    path.join(courseDir, "_course.yaml"),
    "utf-8"
  );
  const meta = yaml.load(metaRaw) as CourseMeta;

  // Read all .md files, sorted by filename (001 < 002 < ...)
  const files = (await fs.readdir(courseDir))
    .filter((f) => f.endsWith(".md"))
    .sort();

  // Parse frontmatter, keep only available modules
  const modules: {
    mdPath: string;
    frontmatter: ModuleFrontmatter;
  }[] = [];

  for (const file of files) {
    const raw = await fs.readFile(path.join(courseDir, file), "utf-8");
    const { data } = matter(raw);
    if (!data.available) continue;
    modules.push({
      mdPath: `courses/${path.basename(courseDir)}/${file}`,
      frontmatter: data as ModuleFrontmatter,
    });
  }

  // Group modules by capsule, preserving order of first appearance
  const capsuleMap = new Map<string, typeof modules>();
  for (const mod of modules) {
    const cap = mod.frontmatter.capsule;
    if (!capsuleMap.has(cap)) capsuleMap.set(cap, []);
    capsuleMap.get(cap)!.push(mod);
  }

  // Delete existing course (cascades to capsules/modules/chapters)
  await prisma.course.deleteMany({ where: { slug: meta.slug } });

  // Build nested create structure
  const capsules = [...capsuleMap.entries()].map(
    ([capsuleTitle, mods], capIdx) => ({
      title: capsuleTitle,
      sortOrder: capIdx + 1,
      modules: {
        create: mods.map((mod, modIdx) => ({
          title: mod.frontmatter.chapter,
          sortOrder: modIdx + 1,
          isLocked: false,
          chapters: {
            create: [
              {
                title: mod.frontmatter.title,
                sortOrder: 1,
                mdPath: mod.mdPath,
                estMin: mod.frontmatter.duration_minutes,
              },
            ],
          },
        })),
      },
    })
  );

  const course = await prisma.course.create({
    data: {
      slug: meta.slug,
      title: meta.title,
      description: meta.description,
      level: meta.level,
      isPremium: meta.isPremium,
      capsules: { create: capsules },
    },
  });

  const totalModules = modules.length;
  const totalCapsules = capsuleMap.size;
  console.log(
    `✅ ${course.slug}: ${totalCapsules} capsule(s), ${totalModules} module(s)`
  );

  return course;
}

async function main() {
  const entries = await fs.readdir(contentDir);

  for (const entry of entries) {
    const fullPath = path.join(contentDir, entry);
    const stat = await fs.stat(fullPath);
    if (!stat.isDirectory()) continue;

    // Skip folders without a _course.yaml
    try {
      await fs.access(path.join(fullPath, "_course.yaml"));
    } catch {
      console.warn(`⚠️  Skipping ${entry} — no _course.yaml found`);
      continue;
    }

    await seedCourse(fullPath);
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

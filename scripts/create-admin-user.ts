import { config as loadEnv } from "dotenv";

import bcrypt from "bcryptjs";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

import { prisma } from "../lib/db";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3];

  if (!email || !password || password.length < 10) {
    console.error(
      "Usage: npm run admin:create-user -- <email> <password>\nPassword must be at least 10 characters.",
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });

  console.log("Admin user saved:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Copies DATABASE_URL and DIRECT_URL from `.env.vercel.production` (from `vercel env pull`)
 * into `.env.local`, replacing any existing lines for those keys. Other lines in `.env.local` are kept.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const pullPath = path.join(root, ".env.vercel.production");
const localPath = path.join(root, ".env.local");

if (!fs.existsSync(pullPath)) {
  console.error("Missing .env.vercel.production. Run: npm run vercel:env:pull-production");
  process.exit(1);
}

const pullText = fs.readFileSync(pullPath, "utf8");
const dbLines = pullText
  .split(/\r?\n/)
  .filter((line) => /^(DATABASE_URL|DIRECT_URL)=/.test(line));

if (dbLines.length === 0) {
  console.error(".env.vercel.production has no DATABASE_URL or DIRECT_URL.");
  process.exit(1);
}

const existing = fs.existsSync(localPath) ? fs.readFileSync(localPath, "utf8") : "";
const kept = existing
  .split(/\r?\n/)
  .filter((line) => line.length > 0 && !/^(DATABASE_URL|DIRECT_URL)=/.test(line));

const out = `${dbLines.join("\n")}\n${kept.length ? `${kept.join("\n")}\n` : ""}`;
fs.writeFileSync(localPath, out, "utf8");
console.log("Updated .env.local with DATABASE_URL and DIRECT_URL from .env.vercel.production.");

import Database from "better-sqlite3";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../dev.db");

const env = readFileSync(path.join(__dirname, "../.env"), "utf8");
const match = env.match(/DATABASE_URL="([^"]+)"/);
if (!match) { console.error("No DATABASE_URL in .env"); process.exit(1); }
const DATABASE_URL = match[1];

const sqlite = new Database(dbPath);
const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const clans = sqlite.prepare("SELECT * FROM Clan").all();
    for (const r of clans) {
      await client.query(
        `INSERT INTO "Clan" (id, name, address, description, enabled, "superAdminId", "superAdminGeneration", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
        [r.id, r.name, r.address, r.description, r.enabled === 1, r.superAdminId, r.superAdminGeneration, r.createdAt, r.updatedAt]
      );
    }
    console.log(`Clans: ${clans.length}`);

    const persons = sqlite.prepare("SELECT * FROM Person").all();
    for (const r of persons) {
      await client.query(
        `INSERT INTO "Person" (id, "firstName", "lastName", "middleName", gender, "birthDate", "birthPlace", "deathDateLunar", "deathPlace", phone, "photoUrl", bio, generation, "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT (id) DO NOTHING`,
        [r.id, r.firstName, r.lastName, r.middleName, r.gender, r.birthDate, r.birthPlace, r.deathDateLunar, r.deathPlace, r.phone, r.photoUrl, r.bio, r.generation, r.createdAt, r.updatedAt]
      );
    }
    console.log(`Persons: ${persons.length}`);

    const rels = sqlite.prepare("SELECT * FROM Relationship").all();
    for (const r of rels) {
      await client.query(
        `INSERT INTO "Relationship" (id, "parentId", "childId")
         VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING`,
        [r.id, r.parentId, r.childId]
      );
    }
    console.log(`Relationships: ${rels.length}`);

    const marriages = sqlite.prepare("SELECT * FROM Marriage").all();
    for (const r of marriages) {
      await client.query(
        `INSERT INTO "Marriage" (id, "spouse1Id", "spouse2Id", "startDate", "endDate")
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [r.id, r.spouse1Id, r.spouse2Id, r.startDate, r.endDate]
      );
    }
    console.log(`Marriages: ${marriages.length}`);

    await client.query("COMMIT");
    console.log("Done!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    sqlite.close();
  }
}

run();

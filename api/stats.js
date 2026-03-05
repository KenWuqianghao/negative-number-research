const { sql } = require("@vercel/postgres");

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS numbers (
      value TEXT PRIMARY KEY,
      discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      search_count INTEGER DEFAULT 1
    )
  `;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await ensureTable();

  const { rows: countRows } = await sql`SELECT COUNT(*) as count FROM numbers`;
  const total = parseInt(countRows[0].count, 10);

  let numberOfTheDay = null;
  if (total > 0) {
    const { rows: randomRows } = await sql`
      SELECT value FROM numbers ORDER BY RANDOM() LIMIT 1
    `;
    numberOfTheDay = randomRows[0]?.value ?? null;
  }

  const { rows: topRows } = await sql`
    SELECT value, search_count FROM numbers
    ORDER BY search_count DESC LIMIT 10
  `;

  res.json({
    total,
    numberOfTheDay,
    topSearched: topRows.map((r) => ({
      number: r.value,
      searches: r.search_count,
    })),
  });
};

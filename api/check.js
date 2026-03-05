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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await ensureTable();

  const { number } = req.body;

  if (number === undefined || number === null || number === "") {
    return res.status(400).json({ error: "Please enter a number" });
  }

  const parsed = Number(number);
  if (!Number.isInteger(parsed) || parsed >= 0) {
    return res.status(400).json({ error: "Please enter a negative integer" });
  }

  const canonical = String(parsed);

  const { rows } = await sql`
    SELECT value, discovered_at, search_count
    FROM numbers WHERE value = ${canonical}
  `;

  if (rows.length > 0) {
    await sql`
      UPDATE numbers SET search_count = search_count + 1
      WHERE value = ${canonical}
    `;
    return res.json({
      status: "found",
      number: canonical,
      discoveredAt: rows[0].discovered_at,
      searchCount: rows[0].search_count + 1,
    });
  }

  const { rows: inserted } = await sql`
    INSERT INTO numbers (value) VALUES (${canonical})
    RETURNING discovered_at
  `;

  return res.json({
    status: "new",
    number: canonical,
    discoveredAt: inserted[0].discovered_at,
  });
};

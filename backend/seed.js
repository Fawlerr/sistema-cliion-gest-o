import { query, pool } from "./src/db/pool.js";
import { initializeDatabase } from "./src/db/pool.js";

async function seedDatabase() {
  try {
    await initializeDatabase();

    const email = "master@clinica.com";
    const role = 1; // ADMIN
    const passwordHash = "$2b$10$fEX7KLobDrBPf/Cmt.4FLuNNREMyJErRGkGIvYTkAuvqKbnFRrFsC";

    const result = await query(
      `INSERT INTO users (name, email, "passwordHash", password_hash, role, "createdAt", "updatedAt", created_at, updated_at)
       SELECT $1, $2, $3, $3, $4, NOW(), NOW(), NOW(), NOW()
       WHERE NOT EXISTS (SELECT 1 FROM users WHERE LOWER(email) = LOWER($2))
       RETURNING id, email, role`,
      ["Admin", email, passwordHash, role]
    );

    if (result.rowCount) {
      console.log("✓ Admin user created successfully:", result.rows[0]);
    } else {
      console.log("✓ Admin user already exists.");
    }

    const services = [
      ["Avaliação fisioterapêutica", "Avaliação inicial para entender histórico, queixa principal e plano terapêutico.", 180, 60],
      ["Sessão de fisioterapia", "Atendimento individual com foco em reabilitação, mobilidade e controle de dor.", 150, 60],
      ["Osteopatia", "Atendimento manual para avaliação e tratamento de disfunções corporais.", 220, 60],
      ["Fisioterapia pélvica", "Atendimento especializado para saúde pélvica e funcionalidade.", 200, 60]
    ];

    for (const [name, description, price, durationMinutes] of services) {
      await query(
        `INSERT INTO services (name, description, price, "durationMinutes")
         SELECT $1, $2, $3, $4
         WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(name) = LOWER($1))`,
        [name, description, price, durationMinutes]
      );
    }

    console.log("✓ Base services ensured.");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding database:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();

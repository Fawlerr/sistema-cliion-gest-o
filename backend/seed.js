import bcrypt from "bcrypt";
import { query, pool } from "./src/db/pool.js";
import { initializeDatabase } from "./src/db/pool.js";

const saltRounds = 10;

async function ensureUser({ name, email, password, role, updateExisting = true }) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const existingUser = await query("SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", [normalizedEmail]);

  if (existingUser.rowCount) {
    if (!updateExisting) {
      console.log("✓ User already exists:", { id: existingUser.rows[0].id, email: normalizedEmail, role });
      return existingUser.rows[0];
    }

    const result = await query(
      `UPDATE users
       SET name = $1,
           "passwordHash" = $2,
           password_hash = $2,
           role = $3,
           "updatedAt" = NOW(),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, role`,
      [name, passwordHash, role, existingUser.rows[0].id]
    );

    console.log("✓ User updated:", result.rows[0]);
    return result.rows[0];
  }

  const result = await query(
    `INSERT INTO users (name, email, "passwordHash", password_hash, role, "createdAt", "updatedAt", created_at, updated_at)
     VALUES ($1, $2, $3, $3, $4, NOW(), NOW(), NOW(), NOW())
     RETURNING id, email, role`,
    [name, normalizedEmail, passwordHash, role]
  );

  console.log("✓ User created:", result.rows[0]);
  return result.rows[0];
}

async function seedDatabase() {
  try {
    await initializeDatabase();

    await ensureUser({
      name: "Admin",
      email: "master@clinica.com",
      password: "admin123",
      role: 1,
      updateExisting: false
    });

    await ensureUser({
      name: "Funcionário Teste",
      email: "funcionario.teste@cliion.com",
      password: "Funccliion775#",
      role: 2
    });

    await ensureUser({
      name: "João Paulo",
      email: "joaopaulofisio9@gmail.com",
      password: "Jpcliion775#",
      role: 1
    });

    const services = [
      ["Avaliação fisioterapêutica", "Avaliação inicial para entender histórico, queixa principal e plano terapêutico.", 180, 60],
      ["Sessão de fisioterapia", "Atendimento individual com foco em reabilitação, mobilidade e controle de dor.", 150, 60],
      ["Osteopatia", "Atendimento manual para avaliação e tratamento de disfunções corporais.", 220, 60],
      ["Fisioterapia pélvica", "Atendimento especializado para saúde pélvica e funcionalidade.", 200, 60]
    ];

    for (const [name, description, price, durationMinutes] of services) {
      await query(
        `INSERT INTO services (name, description, price, "durationMinutes")
         SELECT $1::text, $2::text, $3::numeric, $4::integer
         WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(name) = LOWER($1::text))`,
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

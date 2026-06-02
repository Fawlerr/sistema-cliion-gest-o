import { query, pool } from "./src/db/pool.js";
import { env } from "./src/config/env.js";

async function seedAdmin() {
  try {
    const email = "master@clinica.com";
    const role = 1; // ADMIN
    const passwordHash = "$2b$10$fEX7KLobDrBPf/Cmt.4FLuNNREMyJErRGkGIvYTkAuvqKbnFRrFsC";

    // Injetando NOW() para as colunas de data obrigatórias
    const result = await query(
      `INSERT INTO users (name, email, "passwordHash", role, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, email, role`,
      ["Admin", email, passwordHash, role]
    );

    console.log("✓ Admin user created successfully:", result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error("✗ Error creating admin user:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedAdmin();
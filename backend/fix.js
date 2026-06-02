import { query, pool } from "./src/db/pool.js";

async function fixAdminPassword() {
  try {
    // O nosso hash imbatível
    const hash = "$2b$10$fEX7KLobDrBPf/Cmt.4FLuNNREMyJErRGkGIvYTkAuvqKbnFRrFsC";

    // Atualizamos AS DUAS colunas ao mesmo tempo para o usuário master
    const result = await query(
      `UPDATE users 
       SET password_hash = $1, "passwordHash" = $1 
       WHERE email = 'master@clinica.com'
       RETURNING email`,
      [hash]
    );

    if (result.rowCount > 0) {
      console.log("✅ As duas colunas de senha foram sincronizadas com sucesso!");
    } else {
      console.log("⚠️ Usuário master não encontrado.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("✗ Erro:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixAdminPassword();
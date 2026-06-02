export default {
  datasource: {
    // Tenta pegar do .env, se vier vazio, usa a string direta da porta 5433
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/cliion?schema=public",
  }
}
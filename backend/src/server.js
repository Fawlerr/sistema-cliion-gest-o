import { app } from './app.js';
import { initializeDatabase } from './db/pool.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend', error);
  }
}

startServer();

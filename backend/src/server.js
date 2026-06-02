import { app } from './app.js';
// APAGUE OU COMENTE ESTA LINHA:
// import { initializeDatabase } from './db/pool.js'; 

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // APAGUE OU COMENTE ESTA LINHA TAMBÉM:
    // await initializeDatabase(); 
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend', error);
  }
}

startServer();
import { supabase } from '@shared/supabase';
import cors from 'cors';
import express, { NextFunction, type Request, Response } from "express";
import { createServer } from 'http';
import { setupAuth } from "./auth";
import { config } from './config';
import { runMigrations } from './migrations';
import { registerRoutes } from "./routes";
import { log, serveStatic, setupVite } from "./vite";
import { initWebsocket } from './websocket';

const app = express();
const httpServer = createServer(app);

// Configurar CORS antes de qualquer middleware
app.use(cors({
  origin: true, // Permitir origens com credenciais
  credentials: true, // Permitir envio de cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configurar a autenticação e sessão
setupAuth(app);

// Inicializar o WebSocket para comunicação em tempo real
initWebsocket(httpServer);

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Verificar conexão com o Supabase e executar migrações se necessário
    if (config.storage.type === 'supabase') {
      log('Verificando conexão com o Supabase...');
      
      const connectionTest = await supabase.from('system_info').select('*').limit(1);
      
      if (connectionTest.error) {
        log(`Erro ao conectar com o Supabase: ${connectionTest.error.message}`);
        log('Executando migrações iniciais...');
        
        const migrationResult = await runMigrations();
        
        if (!migrationResult.success) {
          log(`Falha nas migrações: ${String(migrationResult.error)}`);
          log('O aplicativo continuará usando armazenamento em memória.');
        } else {
          log('Migrações realizadas com sucesso!');
        }
      } else {
        log('Conexão com o Supabase estabelecida com sucesso!');
      }
    }
    
    // Registrar rotas da API
    await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importante: apenas configura o vite em desenvolvimento e após
    // configurar todas as outras rotas para que a rota catch-all
    // não interfira com as outras rotas
    if (config.env === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }

    // Usar a porta definida na configuração
    httpServer.listen({
      port: config.port,
      host: "0.0.0.0", // Permitir conexões externas
    }, () => {
      const address = httpServer.address();
      const actualPort = typeof address === 'object' && address ? address.port : config.port;
      log(`Servidor rodando em http://0.0.0.0:${actualPort}`);
      log(`Ambiente: ${config.env}`);
      log(`Armazenamento: ${config.storage.type}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      log('Erro ao iniciar o servidor:', error.message);
    } else {
      log('Erro desconhecido ao iniciar o servidor');
    }
    process.exit(1);
  }
})();

/**
 * Script para copiar o arquivo _redirects para a pasta de build
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para garantir que o diretório existe
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// Caminhos
const sourcePath = path.resolve(__dirname, '../public/_redirects');
const targetPath = path.resolve(__dirname, '../dist/public/_redirects');

// Verificar se o arquivo fonte existe
if (!fs.existsSync(sourcePath)) {
  console.log('Criando arquivo _redirects...');
  // Criar arquivo _redirects se não existir
  ensureDirectoryExistence(sourcePath);
  fs.writeFileSync(sourcePath, '/* /index.html 200');
}

// Copiar para a pasta de build
try {
  ensureDirectoryExistence(targetPath);
  fs.copyFileSync(sourcePath, targetPath);
  console.log('✅ Arquivo _redirects copiado com sucesso para dist/public');
} catch (error) {
  console.error('❌ Erro ao copiar arquivo _redirects:', error);
  process.exit(1);
} 
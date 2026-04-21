#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const API_ENV_PATH = path.join(ROOT_DIR, 'apps/api/.env.local');
const WEB_ENV_PATH = path.join(ROOT_DIR, 'apps/web/.env.local');

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warn: '⚠️',
    error: '❌',
  };
  console.log(`${icons[type]} ${message}`);
}

function generateSecret(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function checkDockerRunning() {
  try {
    execSync('docker info', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function isContainerRunning(name) {
  try {
    execSync(`docker ps -q -f name=${name}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function setupEnvFiles() {
  log('Setting up environment files...');

  const jwtSecret = generateSecret();
  const serviceRoleKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify({
    iss: 'supabase',
    ref: ':localhost',
    role: 'service_role',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 31536000,
  })).toString('base64')}`;

  const apiEnvContent = `# Database
DATABASE_URL=postgresql://omnidoc:omnidoc_dev@localhost:5432/omnidoc
DIRECT_URL=postgresql://omnidoc:omnidoc_dev@localhost:5432/omnidoc

# Supabase Auth (GoTrue)
SUPABASE_URL=http://localhost:9999
SUPABASE_JWT_SECRET=${jwtSecret}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}

# Redis
REDIS_URL=http://localhost:6379

# App
APP_URL=http://localhost:3000
API_URL=http://localhost:3001

# Development
DEV_MODE=true
`;

  const webEnvContent = `NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=http://localhost:9999
NEXT_PUBLIC_SUPABASE_ANON_KEY=${serviceRoleKey}
`;

  if (!fs.existsSync(API_ENV_PATH)) {
    fs.writeFileSync(API_ENV_PATH, apiEnvContent);
    log('Created apps/api/.env.local');
  } else {
    log('apps/api/.env.local already exists');
  }

  if (!fs.existsSync(WEB_ENV_PATH)) {
    fs.writeFileSync(WEB_ENV_PATH, webEnvContent);
    log('Created apps/web/.env.local');
  } else {
    log('apps/web/.env.local already exists');
  }
}

async function startDocker() {
  const postgresRunning = isContainerRunning('omnidoc-postgres');
  const authRunning = isContainerRunning('omnidoc-auth');
  const redisRunning = isContainerRunning('omnidoc-redis');

  if (postgresRunning && authRunning && redisRunning) {
    log('Docker containers already running');
    return;
  }

  log('Starting Docker containers...');

  try {
    execSync('docker compose -f infra/docker/docker-compose.yml up -d', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
  } catch (error) {
    log('Failed to start Docker containers', 'error');
    throw error;
  }

  log('Waiting for services to be ready...');

  execSync('until docker exec omnidoc-postgres pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done', {
    stdio: 'pipe',
    shell: '/bin/bash',
  });
  log('PostgreSQL is ready');

  execSync('until curl -s http://localhost:9999/health > /dev/null 2>&1; do sleep 1; done', {
    stdio: 'pipe',
    shell: '/bin/bash',
  });
  log('GoTrue (Auth) is ready');

  execSync('until docker exec omnidoc-redis redis-cli ping > /dev/null 2>&1; do sleep 1; done', {
    stdio: 'pipe',
    shell: '/bin/bash',
  });
  log('Redis is ready');
}

async function fixGoTrueMigrations() {
  log('Fixing GoTrue migrations...');

  try {
    execSync(`docker exec omnidoc-postgres psql -U postgres -d postgres -c "
      -- Add auth to search_path for gotrue
      ALTER DATABASE postgres SET search_path TO \\$user, public, auth, extensions;
      
      -- Mark problematic migration as applied
      INSERT INTO auth.schema_migrations (version) VALUES ('20221208132122_backfill_email_last_sign_in_at') ON CONFLICT DO NOTHING;
    "`, {
      stdio: 'pipe',
    });

    execSync('docker restart omnidoc-postgres', { stdio: 'pipe' });
    execSync('sleep 5', { stdio: 'pipe', shell: '/bin/bash' });
    execSync('docker restart omnidoc-auth', { stdio: 'pipe' });
    execSync('sleep 3', { stdio: 'pipe', shell: '/bin/bash' });
    
    log('GoTrue migrations fixed and services restarted');
  } catch (error) {
    log('Error fixing migrations (may already be fixed): ' + error.message, 'warn');
  }
}

async function runMigrations() {
  log('Running database migrations...');

  try {
    execSync('pnpm --filter api prisma migrate dev --name init', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
    log('Migrations complete');
  } catch (error) {
    log('Migration failed or already applied', 'warn');
  }
}

async function runSeed() {
  log('Running database seed...');

  try {
    execSync('pnpm --filter api prisma db seed', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
  } catch (error) {
    log('Seed failed: ' + error.message, 'warn');
  }
}

async function main() {
  console.log('\n🚀 OmniDoc Supabase Setup\n');

  if (!checkDockerRunning()) {
    log('Docker is not running. Please start Docker Desktop first.', 'error');
    process.exit(1);
  }

  try {
    await setupEnvFiles();
    await startDocker();
    await fixGoTrueMigrations();
    await runMigrations();
    await runSeed();

    console.log('\n🎉 Setup complete!\n');
    console.log('📝 Development credentials:');
    console.log('   Email: superadmin@omnidoc.dev');
    console.log('   Password: dev-superadmin-123');
    console.log('\n🔗 URLs:');
    console.log('   Web App: http://localhost:3000');
    console.log('   API: http://localhost:3001');
    console.log('   Supabase Auth: http://localhost:9999');
    console.log('   Mailhog: http://localhost:8025\n');
  } catch (error) {
    log('Setup failed: ' + error.message, 'error');
    process.exit(1);
  }
}

main();

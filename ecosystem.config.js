module.exports = {
  apps: [
    {
      name: 'icsrt-api',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    },
    {
      name: 'icsrt-email-worker',
      script: 'dist/workers/email.worker.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'icsrt-whatsapp-worker',
      script: 'dist/workers/whatsapp.worker.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '800M', // Chromium Puppeteer process headroom
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

module.exports = {
  apps: [
    {
      name: "cliion-backend-django",
      cwd: "./admin-django",
      script: "venv/bin/gunicorn",
      args: "config.wsgi:application --bind 127.0.0.1:8000 --workers 3",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        PYTHONUNBUFFERED: "1",
        DJANGO_SETTINGS_MODULE: "config.settings"
      }
    }
  ]
};

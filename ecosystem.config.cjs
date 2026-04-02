module.exports = {
  apps: [{
    name: 'hudu-mcp',
    script: '/home/azureuser/hudu-mcp-dr/dist/index.js',
    interpreter_args: '--env-file /home/azureuser/hudu-mcp-dr/.env',
    restart_delay: 5000,
    max_restarts: 10,
  }]
}

# HUDU MCP Server

A Model Context Protocol (MCP) server that integrates with HUDU for technical documentation and customer information management. This server allows Large Language Models (LLMs) to interact with HUDU's API to retrieve customer account information, knowledge base articles, assets, and more.

> **This is a fork of [jlbyh2o/hudu-mcp](https://github.com/jlbyh2o/hudu-mcp)** with the following enhancements:
> - Runs as an **HTTP web server** rather than a stdio-only process
> - **Token-based authentication** to secure access to the MCP endpoint
> - **PM2 process management** support for production deployments

## Features

- **Company/Customer Management**: Retrieve company information with advanced filtering
- **Knowledge Base Access**: Search and retrieve technical documentation articles with enhanced filters
- **Asset Management**: Access asset information with comprehensive search capabilities
- **User Management**: Retrieve user information and details
- **Network Management**: Access network configurations and details
- **Procedure Management**: Retrieve documented procedures and workflows
- **Activity Logging**: Access detailed activity logs with filtering
- **Asset Layouts**: Retrieve asset layout definitions and schemas
- **Folder Management**: Access organizational folder structures
- **Password Management**: Secure access to credential information
- **Advanced Search**: Enhanced filtering across all resource types
- **Secure Authentication**: API key-based authentication with HUDU + token auth on the web server
- **Type Safety**: Built with TypeScript and Zod validation
- **Error Handling**: Comprehensive error handling and logging

## Prerequisites

- Node.js 18.0.0 or higher
- A HUDU instance with API access
- HUDU API key (obtainable from your HUDU admin panel)
- PM2 (optional, for production deployments): `npm install -g pm2`

## Installation

### From Source

```bash
git clone https://github.com/drtechwyse/hudu-mcp.git
cd hudu-mcp
npm install
npm run build
```

## Configuration

The server requires the following environment variables:

| Variable | Required | Description |
|---|---|---|
| `HUDU_API_KEY` | Yes | Your HUDU API key (Admin > API Keys) |
| `HUDU_BASE_URL` | Yes | Your HUDU instance URL (domain only, no `/api/v1`) |
| `MCP_AUTH_TOKEN` | Yes | Token used to authenticate requests to this web server |
| `PORT` | No | Port to listen on (default: `3000`) |
| `HOST` | No | Host to bind to (default: `0.0.0.0`) |

### Setting up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your actual values:
   ```bash
   HUDU_API_KEY=your_actual_api_key_here
   HUDU_BASE_URL=https://your-company.huducloud.com
   MCP_AUTH_TOKEN=your_secure_token_here
   PORT=3000
   HOST=0.0.0.0
   ```

**Important:** The `HUDU_BASE_URL` should only contain your domain (e.g., `https://your-company.huducloud.com`). Do NOT include `/api/v1` in the URL as this is automatically appended by the client.

3. Make sure your `.env` file is not committed to version control (it's already in `.gitignore`)

## Usage

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start listening on the configured `HOST` and `PORT` (default: `http://0.0.0.0:3000`).

### Running with PM2 (Recommended for Production)

This fork includes a PM2 ecosystem config for reliable production deployments on Linux servers.

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Edit `ecosystem.config.cjs` to match your deployment paths:
   ```js
   module.exports = {
     apps: [{
       name: 'hudu-mcp',
       script: '/path/to/hudu-mcp-dr/dist/index.js',
       interpreter_args: '--env-file /path/to/hudu-mcp-dr/.env',
       restart_delay: 5000,
       max_restarts: 10,
     }]
   }
   ```

3. Start the server with PM2:
   ```bash
   pm2 start ecosystem.config.cjs
   ```

4. Save the PM2 process list and enable startup on boot:
   ```bash
   pm2 save
   pm2 startup
   ```

**Useful PM2 commands:**
```bash
pm2 status          # Check server status
pm2 logs hudu-mcp   # View live logs
pm2 restart hudu-mcp
pm2 stop hudu-mcp
```

### Token Authentication

All requests to the MCP web server must include a bearer token in the `Authorization` header:

```
Authorization: Bearer your_secure_token_here
```

The token value must match the `MCP_AUTH_TOKEN` environment variable. Requests without a valid token will be rejected with a `401 Unauthorized` response.

### Connecting Claude Desktop to the Web Server

Because this fork runs as an HTTP server rather than a local process, configure Claude Desktop to connect to it over the network:

```json
{
  "mcpServers": {
    "hudu": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "HUDU_API_KEY": "your_hudu_api_key_here",
        "HUDU_BASE_URL": "https://your-hudu-instance.huducloud.com"
      }
    }
  }
}
```

A pre-filled template is available in `claude-desktop-config.json` in the repo root.

### Startup Validation

The MCP server automatically validates your API connection during startup by calling the `/api_info` endpoint. This ensures:

- Your `HUDU_API_KEY` is valid and active
- Your `HUDU_BASE_URL` is correct and accessible
- Your API key has the necessary permissions

If validation fails, you'll see a clear error message:
- **401 errors**: Invalid or expired API key
- **403 errors**: API key lacks sufficient permissions
- **404/connection errors**: Incorrect base URL or network issues

## Response Size Management

The MCP server automatically handles large responses to prevent token limit issues:

- **Automatic Truncation**: Responses larger than ~3MB are automatically truncated
- **Truncation Indicators**: Truncated responses include `_truncation_info` with details
- **Pagination Recommended**: Use `page` and `page_size` parameters to get smaller chunks
- **Array Limits**: Large arrays are truncated with information about remaining items
- **Text Field Limits**: Long text fields (>10KB) are truncated with "[truncated]" indicator

### Best Practices for Large Datasets

1. **Use Pagination**: Always use `page_size` parameter (max 100) to limit results
2. **Filter Results**: Use search and filter parameters to narrow down results
3. **Incremental Queries**: For large datasets, make multiple smaller queries
4. **Monitor Truncation**: Check for `_truncation_info` in responses to detect truncated data

Example of paginated query:
```json
{
  "page": 1,
  "page_size": 25,
  "search": "specific term"
}
```

## Available Tools

### Company/Customer Tools

**`get_companies`** - Retrieve a list of companies/customers with advanced filtering

**`get_company_details`** - Get detailed information about a specific company

### Knowledge Base Tools

**`search_articles`** - Search knowledge base articles with enhanced filtering

**`get_article`** - Get detailed content of a specific article

### Asset Management Tools

**`get_assets`** - Retrieve assets with advanced filtering options

**`get_asset_passwords`** - Retrieve password assets (credentials) for a company

**`get_asset_layouts`** - Retrieve asset layout definitions

**`get_asset_layout`** - Get detailed information about a specific asset layout

### User Management Tools

**`get_users`** - Retrieve a list of users

**`get_user`** - Get detailed information about a specific user

### Network Management Tools

**`get_networks`** - Retrieve a list of networks

**`get_network`** - Get detailed information about a specific network

### Procedure Management Tools

**`get_procedures`** - Retrieve a list of procedures

**`get_procedure`** - Get detailed information about a specific procedure

### Activity Logging Tools

**`get_activity_logs`** - Retrieve activity logs with advanced filtering

### Folder Management Tools

**`get_folders`** - Retrieve a list of folders

**`get_folder`** - Get detailed information about a specific folder

## Project Structure

```
src/
├── index.ts              # Main MCP server entry point (HTTP web server)
├── hudu-client.ts        # HUDU API client with type definitions
├── tools/
│   ├── index.ts          # Tool registration and routing
│   ├── company-tools.ts  # Company/customer related tools
│   ├── article-tools.ts  # Knowledge base article tools
│   └── asset-tools.ts    # Asset management tools
└── .env.example          # Environment configuration template
ecosystem.config.cjs      # PM2 process manager configuration
claude-desktop-config.json # Example Claude Desktop configuration
```

## Available Scripts

- `npm run build` - Build the TypeScript project
- `npm run dev` - Run in development mode with hot reload
- `npm run start` - Run the built server
- `npm run watch` - Watch for changes and rebuild
- `npm run clean` - Clean the dist directory

## Security Considerations

- HUDU API keys are passed via environment variables, never hardcoded
- The MCP web server requires token authentication (`MCP_AUTH_TOKEN`) on every request
- Passwords are masked in HUDU list responses
- All HUDU API requests include proper authentication headers
- Input validation using Zod schemas
- Comprehensive error handling to prevent information leakage
- Never commit your `.env` file — it is listed in `.gitignore`

## Troubleshooting

**"Configuration validation failed"**
- Ensure `HUDU_API_KEY`, `HUDU_BASE_URL`, and `MCP_AUTH_TOKEN` are set in your `.env` file
- Verify there are no extra spaces or quotes around the values

**"401 Unauthorized" from the web server**
- Check that your client is sending `Authorization: Bearer <token>` with the correct `MCP_AUTH_TOKEN` value

**"HUDU API Error (401)"**
- Check that your HUDU API key is correct and has not expired

**"HUDU API Error (404)"**
- Verify `HUDU_BASE_URL` is correct and does not include `/api/v1`

**PM2 not starting**
- Confirm the `script` path in `ecosystem.config.cjs` points to the correct built file
- Run `npm run build` first to ensure `dist/index.js` exists
- Check logs with `pm2 logs hudu-mcp`

## API Integration

This MCP server integrates with the HUDU API v1:

- `/api/v1/companies`
- `/api/v1/articles`
- `/api/v1/assets`
- `/api/v1/asset_passwords`
- `/api/v1/asset_layouts`
- `/api/v1/activity_logs`
- `/api/v1/api_info`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues related to:
- **HUDU API**: Consult the HUDU documentation or contact HUDU support
- **MCP Protocol**: See the Model Context Protocol documentation
- **This fork**: Create an issue in this repository
- **Upstream project**: See [jlbyh2o/hudu-mcp](https://github.com/jlbyh2o/hudu-mcp)

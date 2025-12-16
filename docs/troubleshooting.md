# Troubleshooting

Common issues and solutions for MCP Shark.

## Server Won't Start

**Symptoms:**
- Server status shows "not running"
- Error messages in logs
- Port already in use errors

**Solutions:**
1. Check if port 9851 is already in use:
   ```bash
   lsof -i :9851  # macOS/Linux
   netstat -ano | findstr :9851  # Windows
   ```
2. Verify configuration file is valid JSON
3. Check logs in the "MCP Shark Logs" tab
4. Ensure all required dependencies are installed
5. Try restarting MCP Shark

## No Traffic Appearing

**Symptoms:**
- Traffic Capture tab shows no requests
- Statistics show zero requests
- No data in the database

**Solutions:**
1. Verify MCP Shark server is running (check status in Setup tab)
2. Ensure your IDE is configured to use `http://localhost:9851/mcp`
3. Check that your original config file was updated correctly
4. Restart the MCP Shark server
5. Verify your IDE is making MCP requests
6. Check that servers are enabled in the configuration

## Configuration Issues

**Symptoms:**
- Configuration file not detected
- Invalid configuration errors
- Servers not appearing

**Solutions:**
1. Verify your config file is valid JSON
2. Check that server URLs are accessible
3. Ensure stdio commands are available in PATH
4. Review backup files if original config was modified
5. Try uploading the configuration file manually
6. Check file permissions on configuration files

## Installation Issues

**Symptoms:**
- npm installation fails
- Dependencies not installing
- Build errors

**Solutions:**

**Clear npm cache:**
```bash
npm cache clean --force
npm install -g @mcp-shark/mcp-shark
```

**Update npm:**
```bash
npm install -g npm@latest
npx @mcp-shark/mcp-shark
```

**Check Node.js version:**
```bash
node --version  # Should be 18.0.0 or higher
```

**Install dependencies manually:**
```bash
cd ~/.mcp-shark  # or your installation directory
npm install
```

## Playground Not Loading

**Symptoms:**
- Tools, prompts, or resources not appearing
- Loading errors in Playground
- Continuous refresh or infinite requests

**Solutions:**
1. Verify MCP Shark server is running
2. Check server status in the Setup tab
3. Ensure at least one server is enabled
4. Try refreshing the Playground section
5. Check browser console for errors
6. Verify server capabilities are properly configured

## Smart Scan Issues

**Symptoms:**
- Scan fails to start
- No scan results
- Token errors

**Solutions:**
1. Verify Smart Scan token is set correctly
2. Check token in Settings endpoint
3. Ensure token is valid and not expired
4. Try clearing cache and re-scanning
5. Check network connectivity for API calls
6. Review scan logs for error messages

## Database Issues

**Symptoms:**
- Database errors
- Data not persisting
- Export failures

**Solutions:**
1. Check database file permissions
2. Verify database file exists at `~/.mcp-shark/db/mcp-shark.sqlite`
3. Ensure sufficient disk space
4. Try exporting data before troubleshooting
5. Check database file is not locked by another process

## Performance Issues

**Symptoms:**
- Slow UI response
- High memory usage
- Browser freezing

**Solutions:**
1. Clear browser cache
2. Reduce traffic limit in filters
3. Export and clear old data
4. Restart MCP Shark
5. Check system resources (CPU, memory)
6. Use filters to reduce displayed data

## WebSocket Connection Issues

**Symptoms:**
- Real-time updates not working
- Connection errors
- Stale data in UI

**Solutions:**
1. Check WebSocket connection in browser console
2. Verify firewall is not blocking WebSocket connections
3. Try refreshing the page
4. Check server logs for WebSocket errors
5. Verify port 9853 is accessible

## Backup Issues

**Symptoms:**
- Backups not created
- Cannot restore backups
- Backup files missing

**Solutions:**
1. Check backup directory permissions
2. Verify backup directories exist
3. Check disk space availability
4. Review backup file paths in Settings
5. Try manual backup before making changes

## IDE Integration Issues

**Symptoms:**
- IDE not connecting to MCP Shark
- Configuration not updated
- Original config not restored

**Solutions:**
1. Verify IDE configuration file path
2. Check file permissions on config files
3. Ensure MCP Shark has write access to config directory
4. Review backup files for original configuration
5. Manually restore configuration if needed
6. Check IDE logs for connection errors

## Getting Help

If you continue to experience issues:

1. **Check Logs**: Review logs in the "MCP Shark Logs" tab
2. **Review Settings**: Check all paths and settings in the Settings endpoint
3. **Export Data**: Export important data before troubleshooting
4. **GitHub Issues**: Report issues at [GitHub Issues](https://github.com/mcp-shark/mcp-shark/issues)
5. **Documentation**: Review relevant documentation sections

## Common Error Messages

**"Port already in use"**
- Another process is using the port
- Stop the other process or change the port

**"Configuration file not found"**
- Config file path is incorrect
- Check file exists and path is correct

**"Invalid JSON"**
- Configuration file has syntax errors
- Validate JSON syntax

**"Server not responding"**
- MCP server is not running or unreachable
- Check server status and connectivity

**"Database locked"**
- Database is being accessed by another process
- Close other applications accessing the database


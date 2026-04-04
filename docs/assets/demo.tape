# MCP Shark Demo — Terminal GIF
# Record with: vhs docs/assets/demo.tape
# Requires: https://github.com/charmbracelet/vhs

Output docs/assets/demo.gif

Require npx

Set Shell "bash"
Set FontSize 16
Set Width 1200
Set Height 700
Set Padding 20
Set FontFamily "JetBrains Mono"
Set Theme "Catppuccin Mocha"
Set TypingSpeed 40ms
Set CursorBlink false

# Show the scan command
Type "npx @mcp-shark/mcp-shark"
Sleep 500ms
Enter
Sleep 3s

# Let the scan output render fully
Sleep 2s

# Show the list command
Type "npx @mcp-shark/mcp-shark list"
Sleep 500ms
Enter
Sleep 3s

# Show doctor
Type "npx @mcp-shark/mcp-shark doctor"
Sleep 500ms
Enter
Sleep 3s

# Show walkthrough flag
Type "npx @mcp-shark/mcp-shark scan --walkthrough"
Sleep 500ms
Enter
Sleep 4s

# Show fix command
Type "npx @mcp-shark/mcp-shark scan --fix --yes"
Sleep 500ms
Enter
Sleep 3s

# Final pause
Sleep 2s

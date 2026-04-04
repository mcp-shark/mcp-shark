# MCP Shark Full Demo
# Record with: cd mcp-shark && vhs docs/assets/demo.tape

Output docs/assets/demo.gif

Set Shell "bash"
Set FontSize 15
Set Width 1200
Set Height 700
Set Padding 16
Set FontFamily "Menlo"
Set Theme "Catppuccin Mocha"
Set TypingSpeed 50ms
Set CursorBlink false

Sleep 300ms

# 1. Run the scan
Type "node bin/mcp-shark.js"
Sleep 300ms
Enter
Sleep 3s

Sleep 1500ms

# 2. Show server inventory
Type "node bin/mcp-shark.js list"
Sleep 300ms
Enter
Sleep 3s

Sleep 1000ms

# 3. Doctor command
Type "node bin/mcp-shark.js doctor"
Sleep 300ms
Enter
Sleep 3s

Sleep 1000ms

# 4. Show help
Type "node bin/mcp-shark.js --help"
Sleep 300ms
Enter
Sleep 3s

Sleep 1500ms

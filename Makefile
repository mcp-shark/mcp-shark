.PHONY: help install install-all start stop start-ui stop-ui start-server stop-server dev-ui build-ui clean

# Default target
help:
	@echo "MCP Shark - Makefile Commands"
	@echo ""
	@echo "Installation:"
	@echo "  make install          - Install root dependencies"
	@echo "  make install-all      - Install all dependencies (root, mcp-server, ui)"
	@echo ""
	@echo "UI Commands (Recommended):"
	@echo "  make start            - Start the UI server (port 9853) - default"
	@echo "  make start-ui         - Start the UI server (port 9853)"
	@echo "                         Use the UI to configure and start the MCP server"
	@echo "  make stop             - Stop the UI server - default"
	@echo "  make stop-ui          - Stop the UI server"
	@echo "  make dev-ui           - Start UI in development mode"
	@echo "  make build-ui         - Build UI for production"
	@echo ""
	@echo "Server Commands (Alternative):"
	@echo "  make start-server     - Start the MCP server directly (port 9851)"
	@echo "                         Note: Requires manual config at mcp-server/temp/mcps.json"
	@echo "  make stop-server      - Stop the MCP server"
	@echo ""
	@echo "Other:"
	@echo "  make clean            - Clean build artifacts and node_modules"
	@echo "  make help             - Show this help message"

# Installation
install:
	@echo "Installing root dependencies..."
	npm install

install-all:
	@echo "Installing all dependencies..."
	npm install
	@echo "Installing mcp-server dependencies..."
	cd mcp-server && npm install
	@echo "Installing ui dependencies..."
	cd ui && npm install
	@echo "All dependencies installed!"

# UI Commands
start-ui:
	@echo "Starting UI server..."
	@if [ -f ui/.ui.pid ]; then \
		PID=$$(cat ui/.ui.pid); \
		if ps -p $$PID > /dev/null 2>&1; then \
			echo "UI server is already running (PID: $$PID)"; \
			exit 1; \
		else \
			rm ui/.ui.pid; \
		fi; \
	fi
	@cd ui && npm start > .ui.log 2>&1 &
	@sleep 2
	@PID=$$(lsof -ti:9853 2>/dev/null || pgrep -f "node.*server.js" | head -1); \
	if [ -n "$$PID" ]; then \
		echo $$PID > ui/.ui.pid; \
		echo "UI server started (PID: $$PID)"; \
		echo "UI available at http://localhost:9853"; \
	else \
		echo "Warning: Could not determine UI server PID. Check ui/.ui.log for details."; \
	fi

stop-ui:
	@echo "Stopping UI server..."
	@PIDS=$$(lsof -ti:9853 2>/dev/null); \
	if [ -n "$$PIDS" ]; then \
		echo $$PIDS | xargs kill -TERM 2>/dev/null || true; \
		sleep 2; \
		echo $$PIDS | xargs kill -9 2>/dev/null || true; \
	fi
	@cd ui && pkill -f "node.*server.js" 2>/dev/null || true
	@cd ui && pkill -9 -f "node.*server.js" 2>/dev/null || true
	@for PID in $$(pgrep -f "npm.*start" 2>/dev/null); do \
		if [ -n "$$PID" ]; then \
			DIR=$$(pwdx $$PID 2>/dev/null | awk '{print $$2}' | grep -q "ui" && echo "yes" || echo "no"); \
			if [ "$$DIR" = "yes" ]; then \
				kill -TERM $$PID 2>/dev/null || true; \
				sleep 1; \
				kill -9 $$PID 2>/dev/null || true; \
			fi; \
		fi; \
	done
	@rm -f ui/.ui.pid
	@if lsof -ti:9853 > /dev/null 2>&1; then \
		echo "Warning: Some processes may still be running on port 9853"; \
		lsof -ti:9853 | xargs kill -9 2>/dev/null || true; \
	fi
	@echo "UI server stopped"

dev-ui:
	@echo "Starting UI in development mode..."
	cd ui && npm run dev

build-ui:
	@echo "Building UI for production..."
	cd ui && npm run build

# Server Commands
start-server:
	@echo "Starting MCP server..."
	@if [ -f mcp-server/.server.pid ]; then \
		PID=$$(cat mcp-server/.server.pid); \
		if ps -p $$PID > /dev/null 2>&1; then \
			echo "MCP server is already running (PID: $$PID)"; \
			exit 1; \
		else \
			rm mcp-server/.server.pid; \
		fi; \
	fi
	@cd mcp-server && npm start > .server.log 2>&1 &
	@sleep 2
	@PID=$$(lsof -ti:9851 2>/dev/null || pgrep -f "node.*mcp-shark.js" | head -1); \
	if [ -n "$$PID" ]; then \
		echo $$PID > mcp-server/.server.pid; \
		echo "MCP server started (PID: $$PID)"; \
		echo "MCP server available at http://localhost:9851/mcp"; \
	else \
		echo "Warning: Could not determine MCP server PID. Check mcp-server/.server.log for details."; \
	fi

stop-server:
	@echo "Stopping MCP server..."
	@PIDS=$$(lsof -ti:9851 2>/dev/null); \
	if [ -z "$$PIDS" ]; then \
		if [ -f mcp-server/.server.pid ]; then \
			PIDS=$$(cat mcp-server/.server.pid); \
		fi; \
	fi; \
	if [ -z "$$PIDS" ]; then \
		echo "MCP server is not running"; \
		rm -f mcp-server/.server.pid; \
		exit 1; \
	fi; \
	for PID in $$PIDS; do \
		if ps -p $$PID > /dev/null 2>&1; then \
			echo "Stopping process $$PID..."; \
			kill -TERM $$PID 2>/dev/null; \
			sleep 1; \
			if ps -p $$PID > /dev/null 2>&1; then \
				echo "Force killing process $$PID..."; \
				kill -9 $$PID 2>/dev/null; \
			fi; \
			PPID=$$(ps -o ppid= -p $$PID 2>/dev/null | tr -d ' '); \
			if [ -n "$$PPID" ] && [ "$$PPID" != "1" ] && ps -p $$PPID > /dev/null 2>&1; then \
				CMD=$$(ps -p $$PPID -o command= 2>/dev/null); \
				if echo "$$CMD" | grep -q "npm\|node"; then \
					echo "Stopping parent process $$PPID..."; \
					kill -TERM $$PPID 2>/dev/null; \
					sleep 1; \
					if ps -p $$PPID > /dev/null 2>&1; then \
						kill -9 $$PPID 2>/dev/null; \
					fi; \
				fi; \
			fi; \
		fi; \
	done; \
	rm -f mcp-server/.server.pid; \
	echo "MCP server stopped"

# Default commands (map to UI)
start: start-ui
	@echo ""
	@echo "=========================================="
	@echo "UI server started!"
	@echo "  UI: http://localhost:9853"
	@echo ""
	@echo "Use the UI to configure and start the MCP server"
	@echo "=========================================="

stop: stop-ui

# Cleanup
clean:
	@echo "Cleaning up..."
	@make stop 2>/dev/null || true
	@rm -f ui/.ui.pid mcp-server/.server.pid
	@rm -f ui/.ui.log mcp-server/.server.log
	@echo "Cleanup complete"


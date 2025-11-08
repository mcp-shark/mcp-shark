.PHONY: help install install-all start-ui stop-ui start-server stop-server start stop clean

# Default target
help:
	@echo "MCP Shark - Makefile Commands"
	@echo ""
	@echo "Installation:"
	@echo "  make install          - Install root dependencies"
	@echo "  make install-all      - Install all dependencies (root, mcp-server, ui)"
	@echo ""
	@echo "UI Commands:"
	@echo "  make start-ui         - Start the UI server (port 9853)"
	@echo "  make stop-ui          - Stop the UI server"
	@echo "  make dev-ui           - Start UI in development mode"
	@echo "  make build-ui         - Build UI for production"
	@echo ""
	@echo "Server Commands:"
	@echo "  make start-server     - Start the MCP server (port 9851)"
	@echo "  make stop-server      - Stop the MCP server"
	@echo ""
	@echo "Combined Commands:"
	@echo "  make start            - Start both server and UI"
	@echo "  make stop             - Stop both server and UI"
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
		echo "UI server is already running (PID: $$(cat ui/.ui.pid))"; \
		exit 1; \
	fi
	@cd ui && npm start > .ui.log 2>&1 & \
	echo $$! > .ui.pid; \
	echo "UI server started (PID: $$!)"; \
	echo "UI available at http://localhost:9853"

stop-ui:
	@if [ ! -f ui/.ui.pid ]; then \
		echo "UI server is not running"; \
		exit 1; \
	fi
	@PID=$$(cat ui/.ui.pid); \
	if ps -p $$PID > /dev/null 2>&1; then \
		kill $$PID && echo "UI server stopped (PID: $$PID)"; \
		rm ui/.ui.pid; \
	else \
		echo "UI server process not found, cleaning up PID file"; \
		rm ui/.ui.pid; \
	fi

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
		echo "MCP server is already running (PID: $$(cat mcp-server/.server.pid))"; \
		exit 1; \
	fi
	@cd mcp-server && npm start > .server.log 2>&1 & \
	echo $$! > .server.pid; \
	echo "MCP server started (PID: $$!)"; \
	echo "MCP server available at http://localhost:9851/mcp"

stop-server:
	@if [ ! -f mcp-server/.server.pid ]; then \
		echo "MCP server is not running"; \
		exit 1; \
	fi
	@PID=$$(cat mcp-server/.server.pid); \
	if ps -p $$PID > /dev/null 2>&1; then \
		kill $$PID && echo "MCP server stopped (PID: $$PID)"; \
		rm mcp-server/.server.pid; \
	else \
		echo "MCP server process not found, cleaning up PID file"; \
		rm mcp-server/.server.pid; \
	fi

# Combined Commands
start: start-server start-ui
	@echo ""
	@echo "=========================================="
	@echo "MCP Shark is running!"
	@echo "  MCP Server: http://localhost:9851/mcp"
	@echo "  UI:         http://localhost:9853"
	@echo "=========================================="

stop: stop-server stop-ui
	@echo "All services stopped"

# Cleanup
clean:
	@echo "Cleaning up..."
	@make stop 2>/dev/null || true
	@rm -f ui/.ui.pid mcp-server/.server.pid
	@rm -f ui/.ui.log mcp-server/.server.log
	@echo "Cleanup complete"


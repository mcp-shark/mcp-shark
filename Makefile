.PHONY: help install start stop dev build clean lint lint-fix format check check-fix

# Default target
help:
	@echo "MCP Shark - Makefile Commands"
	@echo ""
	@echo "Installation:"
	@echo "  make install          - Install all dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make start            - Build UI and start server (production)"
	@echo "  make dev              - Start UI in development mode"
	@echo "  make build            - Build UI for production"
	@echo "  make stop             - Stop running servers"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             - Check for linting issues"
	@echo "  make lint-fix         - Fix linting issues"
	@echo "  make format           - Format code"
	@echo "  make check            - Check linting and formatting"
	@echo "  make check-fix         - Fix linting and formatting issues"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            - Clean build artifacts and logs"
	@echo "  make help             - Show this help message"

# Installation
install:
	@echo "Installing dependencies..."
	npm install
	@echo "Dependencies installed!"

# Development commands
start:
	@echo "Starting MCP Shark..."
	npm start

dev:
	@echo "Starting development server..."
	npm run dev

build:
	@echo "Building UI for production..."
	npm run build

stop:
	@echo "Stopping servers..."
	@PIDS=$$(lsof -ti:9853 2>/dev/null); \
	if [ -n "$$PIDS" ]; then \
		echo $$PIDS | xargs kill -TERM 2>/dev/null || true; \
		sleep 2; \
		echo $$PIDS | xargs kill -9 2>/dev/null || true; \
	fi
	@PIDS=$$(lsof -ti:9851 2>/dev/null); \
	if [ -n "$$PIDS" ]; then \
		echo $$PIDS | xargs kill -TERM 2>/dev/null || true; \
		sleep 2; \
		echo $$PIDS | xargs kill -9 2>/dev/null || true; \
	fi
	@echo "Servers stopped"

# Code quality
lint:
	@echo "Checking for linting issues..."
	npm run lint

lint-fix:
	@echo "Fixing linting issues..."
	npm run lint:fix

format:
	@echo "Formatting code..."
	npm run format

check:
	@echo "Checking code quality..."
	npm run check

check-fix:
	@echo "Fixing code quality issues..."
	npm run check:fix

# Cleanup
clean:
	@echo "Cleaning up..."
	@make stop 2>/dev/null || true
	@rm -rf ui/dist
	@rm -f ui/.ui.pid ui/.ui.log
	@rm -f mcp-server/.server.pid mcp-server/.server.log
	@echo "Cleanup complete"

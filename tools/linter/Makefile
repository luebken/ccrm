# CRM Linter Makefile

.PHONY: help setup build lint lint-verbose test clean example init install clean-examples list-examples

# Default target
help:
	@echo "CRM Linter - Available targets:"
	@echo "  setup           Install linter dependencies"
	@echo "  build           Compile TypeScript to dist/"
	@echo "  lint            Run the CRM linter on /crm directory"
	@echo "  lint-verbose    Run linter with detailed output"
	@echo "  test            Run linter test suite"
	@echo "  clean           Clean build artifacts"
	@echo "  init            Initialize CRM directory structure"
	@echo "  example         Create example CRM entities in ./crm"
	@echo "  clean-examples  Remove example CRM entities"
	@echo "  list-examples   List example files in CRM directory"
	@echo "  install         Install linter globally (npm link)"

# Install dependencies
setup:
	@echo "📦 Installing linter dependencies..."
	npm install
	@echo "✅ Dependencies installed"

# Build TypeScript
build: setup
	@echo "🔨 Building TypeScript..."
	npm run build
	@echo "✅ Build complete"

# Install globally for easy access
install: build
	@echo "🔗 Installing linter globally..."
	npm link
	@echo "✅ Linter installed globally as 'crm-lint'"

# Run linter on CRM directory
lint: build
	@if [ -d "../../crm" ]; then \
		echo "🔍 Running CRM linter..."; \
		node dist/cli.js ../../crm; \
	else \
		echo "❌ CRM directory not found. Run 'make init' first."; \
		exit 1; \
	fi

# Run linter with verbose output
lint-verbose: build
	@if [ -d "../../crm" ]; then \
		echo "🔍 Running CRM linter (verbose)..."; \
		node dist/cli.js ../../crm --verbose; \
	else \
		echo "❌ CRM directory not found. Run 'make init' first."; \
		exit 1; \
	fi

# Run tests (placeholder for future test implementation)
test: build
	@echo "🧪 Running tests..."
	@echo "⚠️  Tests not implemented yet"

# Initialize CRM directory structure
init: build
	@echo "📁 Initializing CRM directory structure..."
	node dist/cli.js init ../../crm
	@echo "✅ CRM directory initialized"

# Create example entities
example: build
	@echo "📝 Creating example CRM entities..."
	node dist/cli.js example ../../crm
	@echo "✅ Example entities created"

# Remove example entities
clean-examples: build
	@echo "🗑️  Removing example CRM entities..."
	node dist/cli.js clean-examples ../../crm
	@echo "✅ Example entities removed"

# List example entities
list-examples: build
	@echo "📋 Listing example CRM entities..."
	node dist/cli.js list-examples ../../crm

# Clean build artifacts and examples
clean: clean-examples
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist node_modules package-lock.json
	@echo "✅ Clean complete"

# Development workflow - setup everything
dev-setup: setup build init example
	@echo "🚀 Development setup complete!"
	@echo "  • Linter built and ready"
	@echo "  • CRM directory initialized"
	@echo "  • Example entities created"
	@echo ""
	@echo "Next steps:"
	@echo "  • Run 'make lint' to validate the CRM data"
	@echo "  • Run 'make install' to install globally"

# Quick validation workflow
validate: lint
	@echo "✅ Validation complete"

# Rebuild and test cycle
rebuild: clean build lint
	@echo "🔄 Rebuild and validation complete"
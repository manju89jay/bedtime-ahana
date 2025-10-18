.PHONY: analyze build dev start lint test coverage docs

analyze:
	@node tools/analyze_repo.mjs

build:
	npm run build

start:
	npm run start

dev:
	npm run dev

lint:
	npm run lint

test:
	npm run test

coverage:
	npm run coverage

docs:
	@echo "Docs: ARCHITECTURE.md, RATIONALE.md, LANGUAGE_EVAL.md, PERFORMANCE.md, BUILD.md, OUTPUTS.md"

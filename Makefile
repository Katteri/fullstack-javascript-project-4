install:
	npm ci

test:
	npx jest

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

lint-fix:
	npx eslint --fix .

publish:
	npm publish --dry-run
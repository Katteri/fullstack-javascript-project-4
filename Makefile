install:
		npm ci
		npm link

publish:
		npm publish --dry-run

lint:
		npx eslint .

test:
		npm test

debug-test:
		npm run debug-test

test_coverage:
		npx jest --coverage

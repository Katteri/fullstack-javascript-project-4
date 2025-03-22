install:	#Установка пакетов
	npm ci

link:		#Линк пакетов
	sudo npm link

publish:	#Проверка публикации
	npm publish --dry-run

lint:		#Проверка линтером
	npx eslint .

jest:		#Запуск тестов
	NODE_OPTIONS=--experimental-vm-modules npx jest --coverage
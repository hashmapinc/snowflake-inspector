all: install prod

install:
	npm i

prod:
	npx webpack --mode=production

dev:
	npx webpack --mode=development

devserver:
	npx webpack-dev-server --open --mode=development
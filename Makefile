all: install prod

install:
	npm i

prod:
	npx webpack --mode=production

dev:
	npx webpack --mode=development

devserver:
	npx webpack-dev-server --open --mode=development

image: prod
	docker build -t snowflake-inspector .

container:
	docker run -it -p 8083:80 snowflake-inspector
	echo "open localhost:8083/bundle.html in your browser to get started."
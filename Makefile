all: install prod

install:
	npm i

prod:
    export NODE_OPTIONS=--openssl-legacy-provider
	npx webpack --mode=production

dev:
    export NODE_OPTIONS=--openssl-legacy-provider
	npx webpack --mode=development

devserver:
    export NODE_OPTIONS=--openssl-legacy-provider
	npx webpack-dev-server --open --mode=development

image: prod
    export NODE_OPTIONS=--openssl-legacy-provider
	docker build -t snowflake-inspector .

container:
	docker run -it -p 8083:80 snowflake-inspector
	echo "open localhost:8083/bundle.html in your browser to get started."
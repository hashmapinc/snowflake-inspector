![CircleCI](https://img.shields.io/circleci/build/github/hashmapinc/snowflake-inspector/master?label=CircleCI%20Master%20Build)

# Snowflake Inspector
Welcome to the Snowflake Inspector project! 

You can access a live version of the tool at http://snowflakeinspector.com

## How to Build:
To build the project, ensure you have `npm` installed and do the following:
- run `npm i` to install dependencies
- run `npm run build` to build the static website. The files will show up in `dist/`

Alternatively, you can make use of the `Makefile`:
- Run `make` to install all dependencies and build the production bundle of the inspector site

## How to run locally for development
- Run `npm i` to install dependencies
- Run `npm start` and visit http://localhost:9000/bundle.html

## How to build and run with Docker
- Run `npm i` to install dependencies
- Run `npx webpack --mode=production` to build the production distribution of the static site files
- Run `docker build -t snowflake-inspector .` to build the image locally.
- Run `docker run -it -p 8083:80 snowflake-inspector` to run a container based on the image you just built.
- Access the site at http://localhost:8083/bundle.html

Alternatively, you can make use of the `Makefile`:
- Run `make install && make container` to install npm modules, generate the production build of Snowflake Inspector, create a local `snowflake-inspector` Docker image (based on `nginx`), and start that container on port `8083`
- Access the site at http://localhost:8083/bundle.html

## Reach out + Feedback
You can contact us at https://www.hashmapinc.com/reach-out if you want to learn more about Hashmap.

You can also provide feedback on this tool at https://forms.gle/42ACP1waPistVdTu9


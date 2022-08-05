ARG RELEASE_VERSION=""

FROM node:alpine
RUN npm i -g tmpltr$RELEASE_VERSION
WORKDIR /usr/src/
ENTRYPOINT [ "tmpltr" ]
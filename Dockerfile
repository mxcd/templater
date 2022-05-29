FROM node:alpine
RUN npm i -g tmpltr
WORKDIR /usr/src/
ENTRYPOINT [ "tmpltr" ]
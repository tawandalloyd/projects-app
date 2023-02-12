FROM node:14
WORKDIR /usr/src/app
RUN npm install --global nodemon
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install 
COPY . ./
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "run", "dev"]
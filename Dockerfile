FROM node:8

ENV APP /app
WORKDIR $APP

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
# Ensure both package.json AND package-lock.json are copied if applicable (npm@5+).
# If using npm yarn.lock should not exist, and if using yarn package-lock.json should not exist. 
COPY package*.json yarn.lock Procfile $APP/

# Install package necessary for PostgreSQL client
RUN apt update
RUN apt -y install libpq-dev
# Install g++ necessary for any package built with node-gyp
RUN apt -y install g++

# Copy over the app
COPY ./www $APP/www
COPY ./db $APP/db

RUN yarn

# Make sure CMD runs as non root user
RUN useradd -m myuser
USER myuser

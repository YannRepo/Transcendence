FROM node:18

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

#try to add a yarn build or npm build

RUN chmod 777 script_init.sh

# Start the application
CMD [ "./script_init.sh" ]
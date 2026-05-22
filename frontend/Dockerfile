FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package manifests and install
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY . .

# Expose Next dev port
EXPOSE 3000

# Default to dev server (developer convenience).
CMD ["npm", "run", "dev"]

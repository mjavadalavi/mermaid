FROM node:18-slim

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libgbm1 \
    libxshmfence1 \
    curl \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Persian fonts
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome manually 
RUN apt-get update && apt-get install -y chromium \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Set npm configurations to avoid permission issues and improve reliability
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000

# Copy package.json and package-lock.json
COPY package*.json ./

# Skip Puppeteer download during npm install
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install app dependencies with proper error handling
RUN npm install --no-optional || (cat npm-debug.log && exit 1)

# Copy app source
COPY . .

# Create necessary directories
RUN mkdir -p /usr/src/app/temp /usr/src/app/output /usr/src/app/public

# Set environment variables for Puppeteer to use the installed Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# We'll run as root since we're using --no-sandbox in Puppeteer
# This is safe in a container environment with proper security measures

# Make sure the chromium executable is accessible
RUN chmod 755 /usr/bin/chromium

# Make sure temp and output directories have proper permissions
RUN mkdir -p /usr/src/app/temp /usr/src/app/output \
    && chmod -R 777 /usr/src/app/temp /usr/src/app/output

# Expose port
EXPOSE 3000

# Start the app 
CMD ["node", "index.js"] 
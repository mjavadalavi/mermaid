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

# Create a non-root user to run our application
RUN groupadd -r mermaid && useradd -r -g mermaid -G audio,video mermaid \
    && mkdir -p /home/mermaid \
    && chown -R mermaid:mermaid /home/mermaid

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

# Create necessary directories with proper permissions
RUN mkdir -p temp output public \
    && chmod -R 777 temp output public

# Set environment variables for Puppeteer to use the installed Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Change ownership of all application files to non-root user
RUN chown -R mermaid:mermaid /usr/src/app

# Switch to non-root user
USER mermaid

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "index.js", "--puppeteer-args=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage"] 
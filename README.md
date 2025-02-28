# Mermaid API

A simple API for rendering [Mermaid](https://mermaid.js.org/) diagrams to PNG.

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Install Chrome headless shell for Puppeteer:
   ```
   npx puppeteer browsers install chrome-headless-shell
   ```

## Usage

Start the server:
```
npm start
```

The server will run on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### Render Mermaid Diagram

**Endpoint:** `POST /render`

**Basic Request Body:**
```json
{
  "code": "graph TD;\nA-->B;\nA-->C;\nB-->D;\nC-->D;"
}
```

**Advanced Request Body with Custom Options:**
```json
{
  "code": "graph TD;\nA-->B;\nA-->C;\nB-->D;\nC-->D;",
  "options": {
    "theme": "default",
    "width": 1200,
    "height": 800,
    "scale": 2,
    "backgroundColor": "transparent",
    "fontFamily": "Comic Sans MS, cursive",
    "fontSize": "16px",
    "roughStyle": true,
    "curveTension": 0.7
  }
}
```

**Available Options:**
- `theme`: The theme to use (default: "default")
- `width`: Width of the output image in pixels (default: 1200)
- `height`: Height of the output image in pixels (default: 800)
- `scale`: Scale factor for the output image (default: 2)
- `backgroundColor`: Background color of the output image (default: "transparent")
- `fontFamily`: Font family to use (default: "Comic Sans MS, cursive")
- `fontSize`: Font size to use (default: "16px")
- `roughStyle`: Whether to use a hand-drawn, rough sketch style (default: true)
- `curveTension`: Controls how curved the connecting lines are (0.0-1.0, default: 0.7)

**Response:**
- PNG image of the rendered diagram

**Example:**
```bash
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD;\nA-->B;\nA-->C;\nB-->D;\nC-->D;"}'
```

**Example with Hand-drawn Style:**
```bash
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{"code":"graph TD;\nA-->B;\nA-->C;\nB-->D;\nC-->D;", "options": {"roughStyle": true, "curveTension": 0.8}}'
```

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

## Requirements

- Node.js
- NPM
- Chrome headless shell (installed via Puppeteer)

## Dependencies

- express
- @mermaid-js/mermaid-cli 
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Parse command line arguments
const args = process.argv.slice(2);
let puppeteerArgs = [];

// Look for --puppeteer-args flag
const puppeteerArgsIndex = args.findIndex(arg => arg.startsWith('--puppeteer-args='));
if (puppeteerArgsIndex !== -1) {
    const argsString = args[puppeteerArgsIndex].split('=')[1];
    puppeteerArgs = argsString.split(',');
    console.log('Using Puppeteer args:', puppeteerArgs);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Ensure output directory exists
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Cleanup function for temporary files
function cleanupFiles(inputFile, outputFile) {
    try {
        if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    } catch (err) {
        console.error('Error cleaning up files:', err);
    }
}

// Root endpoint - serve the web interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/render', (req, res) => {
    const mermaidCode = req.body.code;
    if (!mermaidCode) {
        return res.status(400).json({ error: 'No Mermaid code provided' });
    }

    // Get rendering options from request or use defaults
    const options = req.body.options || {};
    const theme = options.theme || 'default';
    const width = options.width || 2000;
    const height = options.height || 1400;
    const scale = options.scale || 3;
    const backgroundColor = options.backgroundColor || '#ffffff';
    const fontFamily = options.fontFamily || 'B Yekan,San Francisco, Vazirmatn, Tahoma, sans-serif';
    const fontSize = options.fontSize || '16px';
    const roughStyle = options.roughStyle !== undefined ? options.roughStyle : false;
    const curveTension = options.curveTension || 0; // Higher values make curves more pronounced

    // Create unique filenames to avoid conflicts
    const timestamp = Date.now();
    const inputFile = path.join(tempDir, `input_${timestamp}.mmd`);
    const configFile = path.join(tempDir, `config_${timestamp}.json`);
    const outputFile = path.join(tempDir, `output_${timestamp}.png`);

    try {
        // Create config file for Mermaid with rough sketch theme and higher quality
        const config = {
            theme: 'default',
            themeVariables: {
                fontFamily: fontFamily,
                fontSize: fontSize,
                primaryColor: '#e0e7ff',
                primaryTextColor: '#333333',
                primaryBorderColor: '#4a90e2',
                lineColor: '#666666',
                secondaryColor: '#f0f0f0',
                tertiaryColor: '#f8f8f8'
            },
            themeCSS: `
                /* Paper texture background for the entire diagram */
                #container {
                    background-color: ${backgroundColor};
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23d2d0c4' fill-opacity='0.1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                    filter: contrast(95%) brightness(102%);
                }
                
                /* Node styling (boxes) */
                .node rect, .node circle, .node ellipse, .node polygon, .node path {
                    stroke-width: ${roughStyle ? '2px' : '1.5px'};
                    stroke: #4a90e2;
                    fill: #e0e7ff;
                    rx: 8px;
                    ry: 8px;
                    ${roughStyle ? `
                    filter: url(#rough-paper);
                    box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2);
                    ` : ''}
                }
                
                /* Add subtle animation to nodes */
                ${roughStyle ? `
                @keyframes subtle-float {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(0.5px, 0.5px) rotate(0.1deg); }
                    50% { transform: translate(0, -0.5px) rotate(-0.1deg); }
                    75% { transform: translate(-0.5px, 0) rotate(0deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                
                .node {
                    animation: subtle-float 5s ease-in-out infinite;
                }
                
                .node:nth-child(odd) {
                    animation-delay: 0.5s;
                    animation-duration: 6s;
                }
                
                .node:nth-child(3n) {
                    animation-delay: 1s;
                    animation-duration: 7s;
                }
                ` : ''}
                
                /* Edge styling (arrows) */
                .edgePath .path {
                    stroke: #666666;
                    stroke-width: ${roughStyle ? '2.5px' : '1.5px'};
                    ${roughStyle ? `
                    stroke-dasharray: none;
                    filter: url(#rough-line);
                    ` : ''}
                }
                
                /* Arrow heads */
                .arrowheadPath {
                    fill: #666666;
                    stroke-width: 1px;
                    ${roughStyle ? 'filter: url(#rough-line);' : ''}
                }
                
                /* Edge labels */
                .edgeLabel {
                    font-family: '${fontFamily.split(',')[0]}', sans-serif;
                    background-color: rgba(255, 255, 255, 0.8);
                    padding: 4px;
                    border-radius: 4px;
                    color: #333333;
                    ${roughStyle ? `
                    border: 1px solid #d0d0d0;
                    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
                    ` : ''}
                }
                
                /* Node labels */
                .label {
                    font-family: '${fontFamily.split(',')[0]}', sans-serif;
                    color: #333333;
                    ${roughStyle ? `
                    transform: rotate(0.2deg);
                    ` : ''}
                }
                
                /* SVG filters for the hand-drawn effect */
                ${roughStyle ? `
                defs {
                    /* Paper texture filter */
                    filter: id("rough-paper") {
                        feTurbulence(type="fractalNoise", baseFrequency="0.04", numOctaves="5", seed="1", result="noise")
                        feDisplacementMap(in="SourceGraphic", in2="noise", scale="3", xChannelSelector="R", yChannelSelector="G")
                        feGaussianBlur(stdDeviation="0.5")
                    }
                    
                    /* Line roughness filter */
                    filter: id("rough-line") {
                        feTurbulence(type="fractalNoise", baseFrequency="0.08", numOctaves="3", seed="0", result="noise")
                        feDisplacementMap(in="SourceGraphic", in2="noise", scale="1.5", xChannelSelector="R", yChannelSelector="G")
                    }
                }
                ` : ''}
            `,
            flowchart: {
                htmlLabels: true,
                curve: 'basis',
                diagramPadding: 20,
                useMaxWidth: false,
                nodeSpacing: 50,
                rankSpacing: 80,
                curveTension: curveTension
            },
            er: {
                layoutDirection: 'TB',
                entityPadding: 15
            },
            sequence: {
                diagramMarginX: 50,
                diagramMarginY: 30,
                actorMargin: 50,
                width: 150,
                height: 65
            },
            puppeteerConfig: {
                args: puppeteerArgs.length > 0 ? puppeteerArgs : ['--no-sandbox']
            }
        };
        
        fs.writeFileSync(configFile, JSON.stringify(config));
        
        // Save code to temporary file
        fs.writeFileSync(inputFile, mermaidCode);

        // Execute Mermaid CLI to convert to PNG with sketch theme and higher quality
        // Use puppeteer scale factor for higher resolution
        const puppeteerArgsString = puppeteerArgs.length > 0 ? 
            `--puppeteerArgs ${puppeteerArgs.map(arg => `"${arg}"`).join(' ')}` : 
            '--puppeteerArgs "--no-sandbox"';
            
        exec(`npx mmdc -i ${inputFile} -o ${outputFile} -c ${configFile} -b ${backgroundColor} -w ${width} -H ${height} -s ${scale} ${puppeteerArgsString}`, (error, stdout, stderr) => {
            if (error) {
                console.error('Mermaid CLI error:', error);
                console.error('Stderr:', stderr);
                cleanupFiles(inputFile, outputFile);
                cleanupFiles(configFile, null);
                return res.status(500).json({ error: 'Error rendering Mermaid code' });
            }

            // Send image to client
            res.sendFile(outputFile, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                }
                // Clean up temporary files
                cleanupFiles(inputFile, outputFile);
                cleanupFiles(configFile, null);
            });
        });
    } catch (err) {
        console.error('Error processing request:', err);
        return res.status(500).json({ error: 'Error processing request' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Health check available at http://localhost:${port}/health`);
    if (puppeteerArgs.length > 0) {
        console.log(`Using Puppeteer args: ${puppeteerArgs.join(', ')}`);
    }
});
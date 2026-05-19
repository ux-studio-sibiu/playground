const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const cvDir = path.join(__dirname, 'cv');
const outFile = path.join(__dirname, 'index.html');

function extractBodyContent(html) {
    const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return match ? match[1] : html;
}

function build() {
    const template = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');

    function processIncludes(html, baseDir) {
        const INCLUDE_RE = /<!--.*?@@include\('(.+?)'\).*?-->|@@include\('(.+?)'\)/g;
        return html.replace(INCLUDE_RE, (match, commentedPath, activePath) => {
            if (commentedPath) return match;
            const fullPath = path.join(baseDir, activePath);
            if (!fs.existsSync(fullPath)) {
                console.error(`Missing partial: ${fullPath}`);
                process.exit(1);
            }
            const content = fs.readFileSync(fullPath, 'utf8');
            // If it's a full HTML document, inline only the <body> content
            if (content.trimStart().toLowerCase().startsWith('<!doctype')) {
                return extractBodyContent(content);
            }
            // Recursively process includes relative to the included file's directory
            return processIncludes(content, path.dirname(fullPath));
        });
    }

    const output = processIncludes(template, srcDir);

    fs.writeFileSync(outFile, output, 'utf8');
    console.log(`[${new Date().toLocaleTimeString()}] Built index.html`);
}

build();

if (process.argv.includes('--watch')) {
    console.log('Watching src/ and cv/ for changes...');
    const onChange = (event, filename) => {
        if (filename && filename.endsWith('.html')) {
            console.log(`Changed: ${filename}`);
            build();
        }
    };
    fs.watch(srcDir, { recursive: true }, onChange);
    fs.watch(cvDir, { recursive: true }, onChange);
}


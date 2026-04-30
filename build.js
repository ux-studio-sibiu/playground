const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const outFile = path.join(__dirname, 'index.html');

function build() {
    const template = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');

    const output = template.replace(/<!--.*?@@include\('(.+?)'\).*?-->|@@include\('(.+?)'\)/g, (match, commentedPath, activePath) => {
        if (commentedPath) {
            // Inside an HTML comment — skip entirely
            return match;
        }
        const fullPath = path.join(srcDir, activePath);
        if (!fs.existsSync(fullPath)) {
            console.error(`Missing partial: ${activePath}`);
            process.exit(1);
        }
        return fs.readFileSync(fullPath, 'utf8');
    });

    fs.writeFileSync(outFile, output, 'utf8');
    console.log(`[${new Date().toLocaleTimeString()}] Built index.html`);
}

build();

if (process.argv.includes('--watch')) {
    console.log('Watching src/ for changes...');
    fs.watch(srcDir, { recursive: true }, (event, filename) => {
        if (filename && filename.endsWith('.html')) {
            console.log(`Changed: ${filename}`);
            build();
        }
    });
}

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const outFile = path.join(__dirname, 'index.html');

// INCLUDES: hardcoded list of all @@include tokens used in src/
// To add a new partial: see README.md
const INCLUDES = [
    { token: "@@include('partials/head.html')",                      file: 'src/partials/head.html' },
    { token: "@@include('partials/intro.html')",                     file: 'src/partials/intro.html' },
    { token: "@@include('partials/tools.html')",                     file: 'src/partials/tools.html' },
    { token: "@@include('partials/projects-header.html')",           file: 'src/partials/projects-header.html' },
    { token: "@@include('partials/project-advisor.html')",           file: 'src/partials/project-advisor.html' },
    { token: "@@include('partials/project-case-deschise.html')",     file: 'src/partials/project-case-deschise.html' },
    { token: "@@include('partials/project-4in1.html')",              file: 'src/partials/project-4in1.html' },
    { token: "@@include('partials/project-multidevice.html')",       file: 'src/partials/project-multidevice.html' },
    { token: "@@include('partials/project-white.html')",             file: 'src/partials/project-white.html' },
    { token: "@@include('partials/project-ghost.html')",             file: 'src/partials/project-ghost.html' },
    { token: "@@include('partials/project-configurator.html')",      file: 'src/partials/project-configurator.html' },
    { token: "@@include('partials/project-mipayadmin.html')",        file: 'src/partials/project-mipayadmin.html' },
    { token: "@@include('partials/project-checkout-prototype.html')", file: 'src/partials/project-checkout-prototype.html' },
    { token: "@@include('partials/experiments-header.html')",        file: 'src/partials/experiments-header.html' },
    { token: "@@include('partials/experiment-font-studio.html')",    file: 'src/partials/experiment-font-studio.html' },
    { token: "@@include('partials/experiment-clasa-zero.html')",     file: 'src/partials/experiment-clasa-zero.html' },
    { token: "@@include('partials/experiment-zoom.html')",           file: 'src/partials/experiment-zoom.html' },
    { token: "@@include('partials/experiment-map.html')",            file: 'src/partials/experiment-map.html' },
    { token: "@@include('partials/legacy-header.html')",             file: 'src/partials/legacy-header.html' },
    { token: "@@include('partials/experiment-optimize.html')",       file: 'src/partials/experiment-optimize.html' },
    { token: "@@include('partials/experiment-radio.html')",          file: 'src/partials/experiment-radio.html' },
    { token: "@@include('partials/experiments-architecture-portfolio.html')", file: 'src/partials/experiments-architecture-portfolio.html' },
    { token: "@@include('partials/resume.html')",                    file: 'src/partials/resume.html' },
    { token: "@@include('partials/contact.html')",                   file: 'src/partials/contact.html' },
    { token: "@@include('partials/nav.html')",                       file: 'src/partials/nav.html' },
    { token: "@@include('partials/scripts.html')",                   file: 'src/partials/scripts.html' },
    // Nested include inside contact.html — bodyOnly extracts <body> content from a full HTML document
    { token: "@@include('../../cv/resume-turcanu-razvan.html')",     file: 'cv/resume-turcanu-razvan.html', bodyOnly: true },
];

// Replace token in html, leaving tokens inside <!-- --> comments untouched.
function replaceToken(html, token, content) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return html.replace(new RegExp('<!--[\\s\\S]*?-->|' + escaped, 'g'), (match) => {
        return match === token ? content : match;
    });
}

function build() {
    let output = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');

    // Two passes: first resolves top-level includes (which may introduce nested tokens),
    // second resolves anything that became visible after the first pass (e.g. CV inside contact).
    for (let pass = 0; pass < 2; pass++) {
        for (const { token, file, bodyOnly } of INCLUDES) {
            if (!output.includes(token)) continue;
            const fullPath = path.join(__dirname, file);
            if (!fs.existsSync(fullPath)) {
                console.error(`Missing file: ${fullPath}`);
                process.exit(1);
            }
            let content = fs.readFileSync(fullPath, 'utf8');
            if (bodyOnly) {
                const match = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                content = match ? match[1] : content;
            }
            output = replaceToken(output, token, content);
        }
    }

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


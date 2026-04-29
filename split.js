// One-time script to split index.html into partials
// Run once then delete: node split.js
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const lines = html.split('\n');

const srcDir = path.join(__dirname, 'src');
const partialsDir = path.join(srcDir, 'partials');
fs.mkdirSync(partialsDir, { recursive: true });

// Helper: extract lines (1-based, inclusive)
function extract(startLine, endLine) {
    return lines.slice(startLine - 1, endLine).join('\n');
}

// Find line numbers for key markers
function findLine(pattern, startFrom = 0) {
    for (let i = startFrom; i < lines.length; i++) {
        if (lines[i].includes(pattern)) return i + 1; // 1-based
    }
    return -1;
}

// Find closing </section> after a given line
function findClosingSection(startLine1Based) {
    let depth = 0;
    for (let i = startLine1Based - 1; i < lines.length; i++) {
        const line = lines[i];
        // Count section opens (excluding commented ones)
        const opens = (line.match(/<section[\s>]/g) || []).length;
        const closes = (line.match(/<\/section>/g) || []).length;
        // Skip if line is inside a comment
        if (line.trim().startsWith('<!--') && !line.includes('-->')) continue;
        depth += opens - closes;
        if (depth <= 0 && closes > 0) return i + 1; // 1-based
    }
    return -1;
}

// Map sections by finding their start lines
const sectionStarts = {};
const markers = [
    ['intro', '<!-- INTRO Section -->'],
    ['skills', '<!-- SKILLS Section -->'],
    ['tools', '<!-- TOOLS Section -->'],
    ['projects-header', '<section id="Projects"'],
    ['project-advisor', '<section id="Advisor"'],
    ['project-case-deschise', '<section id="Project-case-deschise"'],
    ['project-4in1', '<section id="Project-4in1"'],
    ['project-multidevice', '<section id="Project-MultiDevice"'],
    ['project-white', '<section id="Project-White"'],
    ['project-ghost', '<section id="Project-Ghost"'],
    ['project-configurator', '<section id="Project-Configurator"'],
    ['project-mipayadmin', '<section id="MipayAdmin"'],
    ['experiments-header', '<!-- Experiments Section -->'],
    ['experiment-clasa-zero', '<!-- Demos - Clasa Zero Section -->'],
    ['experiment-optimize', '<!-- Demos-Optimize Section -->'],
    ['experiment-radio', '<!-- Demos-Radio Section -->'],
    ['resume', '<!-- Resume Section -->'],
    ['contact', '<!-- CONTACT Section -->'],
    ['nav', '<!-- Navigation -->'],
    ['scripts', '<!-- jQuery -->'],
];

for (const [name, marker] of markers) {
    const line = findLine(marker);
    if (line === -1) {
        console.error(`Could not find marker for ${name}: "${marker}"`);
    }
    sectionStarts[name] = line;
}

console.log('Found section starts:', sectionStarts);

// HEAD: from line after <head> to line before </head>
const headOpen = findLine('<head>');
const headClose = findLine('</head>');
const headContent = extract(headOpen + 1, headClose - 1);
fs.writeFileSync(path.join(partialsDir, 'head.html'), headContent);
console.log('Created head.html');

// For each section, extract from its comment/start to its closing </section>
// But we need to handle sections that have preceding comments as part of their block

function extractSection(name, startLine) {
    // Find the <section line (it might be the start line itself or the next line)
    let sectionLine = startLine;
    if (!lines[sectionLine - 1].includes('<section')) {
        // The marker is a comment before the section
        sectionLine = findLine('<section', startLine);
    }
    
    const endLine = findClosingSection(sectionLine);
    // Include the comment line before if it's different from sectionLine
    const actualStart = Math.min(startLine, sectionLine);
    return { content: extract(actualStart, endLine), endLine };
}

// Extract each section partial
const sectionPartials = [
    'intro', 'skills', 'tools', 'projects-header',
    'project-advisor', 'project-case-deschise',
    'project-4in1', 'project-multidevice', 'project-white',
    'project-ghost', 'project-configurator', 'project-mipayadmin',
    'experiments-header',
    'experiment-clasa-zero', 'experiment-optimize', 'experiment-radio',
    'resume', 'contact'
];

for (const name of sectionPartials) {
    const { content } = extractSection(name, sectionStarts[name]);
    fs.writeFileSync(path.join(partialsDir, `${name}.html`), content);
    console.log(`Created ${name}.html`);
}

// NAV: from "<!-- Navigation -->" to the closing </nav> of vertical nav
const navStart = sectionStarts['nav'];
// Find the second </nav>
let navCount = 0;
let navEnd = navStart;
for (let i = navStart - 1; i < lines.length; i++) {
    if (lines[i].includes('</nav>')) {
        navCount++;
        if (navCount === 2) {
            navEnd = i + 1;
            break;
        }
    }
}
fs.writeFileSync(path.join(partialsDir, 'nav.html'), extract(navStart, navEnd));
console.log('Created nav.html');

// SCRIPTS: from <!-- jQuery --> to before </body>
const scriptsStart = sectionStarts['scripts'];
const bodyClose = findLine('</body>');
fs.writeFileSync(path.join(partialsDir, 'scripts.html'), extract(scriptsStart, bodyClose - 1));
console.log('Created scripts.html');

// Now create the template src/index.html
// We need to figure out what goes between sections (commented out blocks, blank lines, etc.)

// Build the template by replacing extracted content with include markers
let template = '';

// DOCTYPE through <body>
const bodyLine = findLine('<body');
template += extract(1, bodyLine) + '\n';
template += '\n';

// Now for each section, add @@include
// But we also need the content between sections (commented-out sections, blank lines)

// Let's track the "last end line" and include any gap content
let lastEnd = bodyLine;

const allParts = [
    ...sectionPartials.map(name => {
        const { content, endLine } = extractSection(name, sectionStarts[name]);
        return { name, startLine: sectionStarts[name], endLine };
    }),
    { name: 'nav', startLine: sectionStarts['nav'], endLine: navEnd },
    { name: 'scripts', startLine: sectionStarts['scripts'], endLine: bodyClose - 1 },
];

// Sort by start line
allParts.sort((a, b) => a.startLine - b.startLine);

for (const part of allParts) {
    // Include any gap between last end and this start
    if (part.startLine > lastEnd + 1) {
        const gap = extract(lastEnd + 1, part.startLine - 1);
        // Only include non-empty gaps
        if (gap.trim()) {
            template += gap + '\n';
        } else {
            template += '\n';
        }
    }
    template += `    @@include('partials/${part.name}.html')\n`;
    lastEnd = part.endLine;
}

// Close body and html
template += '\n</body>\n\n</html>\n';

fs.writeFileSync(path.join(srcDir, 'index.html'), template);
console.log('\nCreated src/index.html template');
console.log('Done! You can now delete this script (split.js)');

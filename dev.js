const { spawn } = require('child_process');

const htmlWatch = spawn('node', ['build.js', '--watch'], { stdio: 'inherit', shell: true });
const sassWatch = spawn('sass', ['css/bundled.scss', 'css/bundled.css', '--watch'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
    htmlWatch.kill();
    sassWatch.kill();
    process.exit();
});

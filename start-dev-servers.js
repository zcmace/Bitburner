// start-dev-servers.js
const {spawn} = require('child_process');
const path = require('path');
const readline = require('readline');

// Define paths
const projectRoot = process.cwd();
const gameDir = path.join(projectRoot, 'game');
const serverDir = path.join(projectRoot, 'server');

console.log('Starting development servers...');

// Function to run a command in a directory
function runCommand(dir, command, args, name) {
    console.log(`\n[${name}] Starting in ${dir}...`);

    // Create a detached process that inherits stdio
    const process = spawn(command, args, {
        cwd: dir,
        stdio: 'inherit',
        shell: true,
        detached: false
    });

    process.on('error', (error) => {
        console.error(`[${name}] Error:`, error.message);
    });

    return process;
}

// Handle keyboard input to control servers
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Start servers and store their processes
const processes = [];

// Start game server
try {
    const gameProcess = runCommand(gameDir, 'npm', ['run', 'dev'], 'GAME');
    processes.push({name: 'GAME', process: gameProcess});
} catch (error) {
    console.error('Failed to start game server:', error);
}

// Start server
try {
    const serverProcess = runCommand(serverDir, 'npm', ['run', 'dev'], 'SERVER');
    processes.push({name: 'SERVER', process: serverProcess});
} catch (error) {
    console.error('Failed to start server:', error);
}

// Setup clean shutdown
console.log('\n--- Both servers are now running ---');
console.log('Press Ctrl+C to stop all servers\n');

// Handle clean shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down all servers...');

    // Kill all child processes
    processes.forEach(({name, process}) => {
        if (!process.killed) {
            console.log(`Stopping ${name}...`);
            process.kill();
        }
    });

    rl.close();
    process.exit(0);
});

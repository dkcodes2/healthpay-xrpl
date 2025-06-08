const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

// Get the directory where the script is located
const SCRIPT_DIR = __dirname;
const STATE_DIR = path.join(SCRIPT_DIR, ".hec-state");

// Ensure state directory exists
if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
}

function writeState(name, data) {
    const filePath = path.join(STATE_DIR, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function readState(name) {
    const filePath = path.join(STATE_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) {
        return undefined;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = {
    xrpl,
    writeState,
    readState,
    STATE_DIR
}; 
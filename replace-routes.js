const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
            isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
        }
    });
}

walk('./src', function(filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('/employer-dashboard')) {
            let newContent = content.replace(/\/employer-dashboard/g, '/dashboard');
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated:', filePath);
        }
    }
});

// Also update tests if they exist
walk('./__tests__', function(filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('/employer-dashboard')) {
            let newContent = content.replace(/\/employer-dashboard/g, '/dashboard');
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated test:', filePath);
        }
    }
});

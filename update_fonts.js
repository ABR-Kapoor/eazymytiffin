const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./app', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/fontSize:\s*["']36px["']/g, 'fontSize: "28px"');
    content = content.replace(/clamp\(24px,\s*5vw,\s*32px\)/g, 'clamp(20px, 4vw, 26px)');
    content = content.replace(/clamp\(22px,\s*5vw,\s*28px\)/g, 'clamp(18px, 4vw, 22px)');
    content = content.replace(/clamp\(24px,5vw,30px\)/g, 'clamp(20px, 4vw, 24px)');
    
    // Specifically looking for h1 elements using text-3xl
    content = content.replace(/<h1[^>]*text-3xl[^>]*>/g, match => match.replace('text-3xl', 'text-2xl'));

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});

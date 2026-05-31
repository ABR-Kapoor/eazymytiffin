const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('app');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Replace table checks
  content = content.replace(/"✅" : "❌"/g, '"Yes" : "No"');
  content = content.replace(/"✅" \? "❌"/g, '"Yes" ? "No"');
  content = content.replace(/"✅" : "—"/g, '"Yes" : "—"');
  
  // Replace toast icons
  content = content.replace(/\{toast\.type === "success" \? "✅ " : "❌ "\}/g, '');
  content = content.replace(/\{toast\.type === "success" \? "✅" : "❌"\} /g, '');
  content = content.replace(/❌ /g, '');
  content = content.replace(/✅ /g, '');
  content = content.replace(/✅/g, '');
  content = content.replace(/❌/g, '');
  
  // Other specific emojis
  content = content.replace(/⏸️ /g, '');
  content = content.replace(/⏸️/g, '');
  content = content.replace(/▶️ /g, '');
  content = content.replace(/▶️/g, '');
  content = content.replace(/✨ /g, '');
  content = content.replace(/✨/g, '');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Modified:', file);
    modifiedCount++;
  }
});
console.log('Total modified:', modifiedCount);

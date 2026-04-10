const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('.git') && !file.includes('node_modules')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.html') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(__dirname);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix bootstrap integrity hash typo (xc -> Xc)
  if (content.includes('NNkmxc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz')) {
     content = content.replace(/NNkmxc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz/g, 'NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz');
     changed = true;
  }

  // Fix image name with space
  if (content.includes('GECPKD IMG.png')) {
     content = content.replace(/GECPKD IMG\.png/g, 'GECPKD_IMG.png');
     changed = true;
  }
  
  if (content.includes('GECPKD%20IMG.png')) {
     content = content.replace(/GECPKD%20IMG\.png/g, 'GECPKD_IMG.png');
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
console.log('Verification completed.');

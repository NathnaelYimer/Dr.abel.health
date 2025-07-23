const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'app', 'api', 'auth', '[...all]');

if (fs.existsSync(targetDir)) {
  console.log('Removing directory:', targetDir);
  fs.rmSync(targetDir, { recursive: true, force: true });
  console.log('Directory removed successfully');
} else {
  console.log('Directory does not exist:', targetDir);
}

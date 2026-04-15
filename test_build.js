const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Starting build...');
  execSync('pnpm --filter web build', { cwd: 'd:/web/family-js', stdio: 'pipe' });
  fs.writeFileSync('d:/web/family-js/build_err.log', 'Success');
  console.log('Build succeeded.');
} catch (e) {
  console.log('Build failed. Writing logs.');
  fs.writeFileSync('d:/web/family-js/build_err.log', 
    (e.stdout ? e.stdout.toString() : '') + '\n' + 
    (e.stderr ? e.stderr.toString() : '') + '\n' + 
    e.message
  );
}

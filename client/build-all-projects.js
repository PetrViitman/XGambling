const { execSync } = require('child_process')
const { readdirSync, existsSync } = require('fs')
const { join } = require('path')

const runBuild = (dir) => {
  console.log(`building ${dir}`)
  execSync('npm run build-standalone', { cwd: dir, stdio: 'inherit' })
  execSync('npm run build-production', { cwd: dir, stdio: 'inherit' })
  execSync('npm run build-presentation', { cwd: dir, stdio: 'inherit' })
}

const findPackageJson = (baseDir) => {
  const subdirs = readdirSync(baseDir, { withFileTypes: true })
  for (const subdir of subdirs) {
    const fullPath = join(baseDir, subdir.name)
    
    if (['node_modules', 'terminal'].includes(subdir.name) || subdir.name.startsWith('.')) {
      continue
    }

    if (subdir.isDirectory()) {
      if (existsSync(join(fullPath, 'package.json'))) {
        runBuild(fullPath)
      } else {
        findPackageJson(fullPath)
      }
    }
  }
};

findPackageJson(__dirname)
const { execSync } = require('child_process');
const { readdirSync, existsSync } = require('fs');
const { join } = require('path');

const installDependencies = (dir) => {
  console.log(`Installing dependencies in ${dir}`);
  execSync('npm install', { cwd: dir, stdio: 'inherit' });
};

const findPackageJson = (baseDir) => {
  const subdirs = readdirSync(baseDir, { withFileTypes: true });
  for (const subdir of subdirs) {
    const fullPath = join(baseDir, subdir.name);
    
    // Исключаем папку node_modules
    if (subdir.name === 'node_modules' || subdir.name.startsWith('.')) {
      continue;
    }

    if (subdir.isDirectory()) {
      if (existsSync(join(fullPath, 'package.json'))) {
        installDependencies(fullPath);
      } else {
        findPackageJson(fullPath); // рекурсивный поиск
      }
    }
  }
};

const rootDir = __dirname; // Корневая папка проекта
findPackageJson(rootDir);
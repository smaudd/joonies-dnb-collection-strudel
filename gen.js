const fs = require("fs");
const path = require("path");

const BASE_URL = `https://raw.githubusercontent.com/${process.env.GITHUB_REPOSITORY}/main/`;

function walkDir(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath, filelist);
    } else if (/\.(wav|mp3|flac)$/i.test(file)) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

// Build a nested tree from paths
function buildTree(files) {
  const tree = {};

  for (const file of files) {
    const rel = path.relative(".", file).replace(/\\/g, "/");
    const parts = rel.split("/");

    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // It's a file
        current[part] = `${rel}`;
      } else {
        // It's a folder
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  }

  return tree;
}

function main() {
  const allFiles = walkDir(".");
  const tree = buildTree(allFiles);

  const output = { _base: BASE_URL, ...tree };

  fs.writeFileSync("strudel.json", JSON.stringify(output, null, 2));
  console.log("✅ strudel.json generated with folder structure");
}

main();


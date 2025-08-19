const fs = require("fs");
const path = require("path");

const BASE_URL = `https://raw.githubusercontent.com/smaudd/joonies-dnb-collection-strudel/main/`;

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

function groupFiles(files) {
  const groups = {};

  files.forEach((file) => {
    const rel = path.relative(".", file).replace(/\\/g, "/"); // relative path
    const parts = rel.split("/");
    if (parts.length > 1) {
      const folder = parts[0];
      groups[folder] = groups[folder] || [];
      groups[folder].push(parts.slice(1).join("/"));
    } else {
      // Try grouping by prefix before "_"
      const [prefix] = parts[0].split("_");
      if (prefix && prefix !== parts[0]) {
        groups[prefix] = groups[prefix] || [];
        groups[prefix].push(parts[0]);
      } else {
        groups["_ungrouped"] = groups["_ungrouped"] || [];
        groups["_ungrouped"].push(parts[0]);
      }
    }
  });

  return groups;
}

function main() {
  const allFiles = walkDir(".");
  const grouped = groupFiles(allFiles);

  const output = { _base: BASE_URL, ...grouped };

  fs.writeFileSync("strudel.json", JSON.stringify(output, null, 2));
  console.log("✅ strudel.json generated");
}

main();


import { copyFileSync, cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const source = resolve("design/b-side-storyboard");
const out = resolve("out");
const files = ["index.html", "style.css", "app.js", "hall.js", "storage.js", "records.json", "map.json", "MAP_DATA_ATTRIBUTION.md"];
if (!existsSync(resolve(out, "archive/index.html"))) throw new Error("Legacy archive export is missing");
for (const name of files) {
  const path = resolve(source, name);
  if (name.endsWith(".json")) JSON.parse(readFileSync(path, "utf8"));
  if (name.endsWith(".js")) {
    const check = spawnSync(process.execPath, ["--input-type=module", "--check"], { input: readFileSync(path), encoding: "utf8" });
    if (check.status !== 0) throw new Error(name + ": " + check.stderr);
  }
  copyFileSync(path, resolve(out, name));
}
for (const name of ["after.webp", "crowd.webp", "dj.webp", "mic.webp", "train.webp"]) {
  if (!existsSync(resolve(source, "art", name))) throw new Error("Missing artwork: " + name);
}
cpSync(resolve(source, "art"), resolve(out, "art"), { recursive: true });
writeFileSync(resolve(out, ".nojekyll"), "");
console.log("Published B-side storyboard at /underground/; previous archive at /underground/archive/");

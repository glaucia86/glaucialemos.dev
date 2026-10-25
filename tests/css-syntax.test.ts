import fs from "node:fs";
import { describe, expect, it } from "vitest";

// Catches broken stylesheets before `next build` does: unbalanced braces and declarations left outside any rule.
const problems = (css: string) => {
  const found: string[] = [];
  let depth = 0;
  css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " ")).split(/\r?\n/).forEach((line, index) => {
    if (depth === 0 && /^\s+[a-z-]+\s*:\s*[^{]*;\s*\}?\s*$/.test(line)) found.push(`linha ${index + 1}: declaração fora de regra`);
    for (const char of line) {
      if (char === "{") depth++;
      if (char === "}" && --depth < 0) { found.push(`linha ${index + 1}: "}" sem par`); depth = 0; }
    }
  });
  if (depth) found.push(`${depth} "{" sem fechamento`);
  return found;
};

describe("sintaxe dos CSS", () => {
  for (const file of fs.readdirSync("src/app").filter((name) => name.endsWith(".css"))) {
    it(file, () => expect(problems(fs.readFileSync(`src/app/${file}`, "utf8"))).toEqual([]));
  }

  it("detecta a linha órfã que quebrou o build", () => {
    expect(problems(".a { color: red; }\n  box-shadow: none; }\n")).not.toEqual([]);
  });
});

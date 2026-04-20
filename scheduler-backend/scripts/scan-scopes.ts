import { Project } from "ts-morph";
import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const files = await glob("src/**/*.ts");

  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });

  project.addSourceFilesAtPaths(files);

  const scopes: Record<string, Set<string>> = {};

  for (const file of project.getSourceFiles()) {
    for (const cls of file.getClasses()) {
      for (const method of cls.getMethods()) {
        for (const decorator of method.getDecorators()) {
          if (decorator.getName() === "Scope") {
            const args = decorator.getArguments();

            if (args.length >= 2) {
              const type = args[0].getText().replace(/['"`]/g, "");
              const param = args[1].getText().replace(/['"`]/g, "");

              if (!scopes[type]) scopes[type] = new Set();
              scopes[type].add(param);
            }
          }
        }
      }
    }
  }

  // Convert Set → Array
  const result = Object.fromEntries(
    Object.entries(scopes).map(([k, v]) => [k, [...v]])
  );

  fs.writeFileSync(
    "scope-registry.json",
    JSON.stringify(result, null, 2)
  );

  console.log("Scopes scanned:");
  console.log(result);
}

main();

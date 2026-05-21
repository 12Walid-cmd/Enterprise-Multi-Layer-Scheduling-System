import { Project, SyntaxKind } from "ts-morph";
import { glob } from "glob";
import * as fs from "fs";

async function main() {
 
  const files = await glob("src/**/*.ts");


  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });

  project.addSourceFilesAtPaths(files);

  const permissions = new Set<string>();


  for (const sourceFile of project.getSourceFiles()) {
   
    for (const cls of sourceFile.getClasses()) {
      // scan class-level decorators
      for (const decorator of cls.getDecorators()) {
        if (decorator.getName() === "Permissions") {
          const args = decorator.getArguments();
          if (args.length > 0) {
            const value = args[0].getText().replace(/['"`]/g, "");
            permissions.add(value);
          }
        }
      }

      // scan 
      for (const method of cls.getMethods()) {
        for (const decorator of method.getDecorators()) {
          if (decorator.getName() === "Permissions") {
            const args = decorator.getArguments();
            if (args.length > 0) {
              const value = args[0].getText().replace(/['"`]/g, "");
              permissions.add(value);
            }
          }
        }
      }
    }
  }

  // 4. output 
  fs.writeFileSync(
    "permissions.json",
    JSON.stringify([...permissions], null, 2)
  );

  console.log("Permissions scanned:");
  console.log([...permissions]);
}

main();

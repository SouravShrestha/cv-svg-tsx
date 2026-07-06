import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import type { ConvertOptions } from "./types.js";
import { convertSvgFile, resolveInputPaths } from "./converter.js";

declare const __VERSION__: string;

const program = new Command();

program
  .name("svg2tsx")
  .description("Convert SVG files into ready-to-use TSX React components")
  .version(typeof __VERSION__ !== "undefined" ? __VERSION__ : "0.0.0-dev")
  .argument("<input...>", "SVG file(s) or folder path(s)")
  .option("-o, --output <dir>", "output directory", ".")
  .option("--suffix <string>", 'component name suffix (e.g. "Icon")', "Icon")
  .option("--default-color <string>", "default value for the color prop", "currentColor")
  .option("--keep-colors", "preserve original SVG colors", false)
  .option("--no-aria-hidden", "don't add aria-hidden to the SVG")
  .option("-f, --force", "overwrite existing files", false)
  .action(run);

program.parse();

function run(inputs: string[], opts: Record<string, unknown>) {
  const options: ConvertOptions = {
    suffix: opts.suffix as string,
    defaultColor: opts.defaultColor as string,
    keepColors: opts.keepColors as boolean,
    ariaHidden: opts.ariaHidden as boolean,
  };

  const outputDir = path.resolve(opts.output as string);
  const force = opts.force as boolean;

  let svgFiles: string[];
  try {
    svgFiles = resolveInputPaths(inputs);
  } catch (err) {
    process.stderr.write(
      chalk.red(`Error: ${(err as Error).message}`) + "\n",
    );
    process.exit(1);
  }

  if (svgFiles.length === 0) {
    process.stderr.write(chalk.yellow("No SVG files found.\n"));
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of svgFiles) {
    const relative = path.relative(process.cwd(), file);
    try {
      const result = convertSvgFile(file, options);
      const outPath = path.join(outputDir, result.outputFileName);

      if (fs.existsSync(outPath) && !force) {
        process.stdout.write(
          chalk.yellow(`  skip `) + `${result.outputFileName} (already exists, use -f to overwrite)\n`,
        );
        skipped++;
        continue;
      }

      fs.writeFileSync(outPath, result.tsx);
      process.stdout.write(
        chalk.green(`  done `) + `${relative} → ${result.outputFileName}\n`,
      );
      success++;
    } catch (err) {
      process.stderr.write(
        chalk.red(`  fail `) + `${relative}: ${(err as Error).message}\n`,
      );
      failed++;
    }
  }

  process.stdout.write("\n");
  const parts: string[] = [];
  if (success) parts.push(chalk.green(`${success} converted`));
  if (skipped) parts.push(chalk.yellow(`${skipped} skipped`));
  if (failed) parts.push(chalk.red(`${failed} failed`));
  process.stdout.write(parts.join(", ") + "\n");

  if (failed > 0) process.exit(1);
}

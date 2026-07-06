import fs from "node:fs";
import path from "node:path";
import type { ConvertOptions, ConvertResult } from "./types.js";
import { fileNameToComponentName } from "./utils.js";
import { parseSvg } from "./parser.js";
import { generateTsx } from "./generator.js";

export function convertSvgFile(
  filePath: string,
  options: ConvertOptions,
): ConvertResult {
  const svgContent = fs.readFileSync(filePath, "utf-8");
  return convertSvgString(svgContent, filePath, options);
}

export function convertSvgString(
  svgContent: string,
  filePath: string,
  options: ConvertOptions,
): ConvertResult {
  const componentName = fileNameToComponentName(filePath, options.suffix);
  const parsed = parseSvg(svgContent, !options.keepColors);
  const tsx = generateTsx(componentName, parsed, options);
  const outputFileName = componentName + ".tsx";

  return { componentName, outputFileName, tsx };
}

export function resolveInputPaths(inputs: string[]): string[] {
  const svgFiles: string[] = [];

  for (const input of inputs) {
    const resolved = path.resolve(input);

    if (!fs.existsSync(resolved)) {
      throw new Error(`Path not found: ${input}`);
    }

    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      const files = fs
        .readdirSync(resolved)
        .filter((f) => f.endsWith(".svg"))
        .map((f) => path.join(resolved, f))
        .sort();
      svgFiles.push(...files);
    } else if (resolved.endsWith(".svg")) {
      svgFiles.push(resolved);
    }
  }

  return svgFiles;
}

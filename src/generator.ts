import type { ConvertOptions, ParsedSvg } from "./types.js";

export function generateTsx(
  componentName: string,
  parsed: ParsedSvg,
  options: ConvertOptions,
): string {
  const lines: string[] = [];

  lines.push('import type { SVGProps } from "react";');
  lines.push("");

  // Always emit the color prop — every icon needs to be tintable
  lines.push("type Props = SVGProps<SVGSVGElement> & {");
  lines.push("  color?: string;");
  lines.push("};");
  lines.push("");

  const destructured = `{ color = "${options.defaultColor}", ...props }`;
  lines.push(`export function ${componentName}(${destructured}: Props) {`);
  lines.push("  return (");

  // Multi-line SVG opening tag for readability
  lines.push("    <svg");
  lines.push(`      width="${parsed.width}"`);
  lines.push(`      height="${parsed.height}"`);
  lines.push(`      viewBox="${parsed.viewBox}"`);
  lines.push(`      fill="none"`);
  lines.push(`      xmlns="http://www.w3.org/2000/svg"`);
  if (options.ariaHidden) {
    lines.push(`      aria-hidden="true"`);
  }
  lines.push("      {...props}");
  lines.push("    >");

  if (parsed.children) {
    lines.push(parsed.children);
  }

  lines.push("    </svg>");
  lines.push("  );");
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

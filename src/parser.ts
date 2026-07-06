import { parseDocument } from "htmlparser2";
import type { Element, ChildNode } from "domhandler";
import { isTag, isText } from "domhandler";
import type { ParsedSvg } from "./types.js";
import {
  svgAttrToJsx,
  shouldSkipAttr,
  isColorAttr,
  isReplaceableColor,
  formatJsxValue,
} from "./utils.js";

export function parseSvg(
  svgContent: string,
  replaceColors: boolean,
): ParsedSvg {
  const doc = parseDocument(svgContent, { xmlMode: true });
  const svgEl = findSvgElement(doc.children);
  if (!svgEl) {
    throw new Error("No <svg> element found");
  }

  const viewBox = extractViewBox(svgEl);
  const { width, height } = extractDimensions(svgEl, viewBox);

  const children = svgEl.children
    .map((child) => nodeToJsx(child, replaceColors, 3))
    .filter(Boolean)
    .join("\n");

  // hasColorProps is true when replaceColors is on and there is at least one
  // element that will receive fill={color} — either an explicit replaceable
  // color attr, or an element with no fill attr at all (implicit black fill).
  const hasColorProps = replaceColors && treeNeedsColor(svgEl);

  return { viewBox, width, height, children, hasColorProps };
}

function findSvgElement(nodes: ChildNode[]): Element | null {
  for (const node of nodes) {
    if (isTag(node) && node.name === "svg") return node;
  }
  return null;
}

function extractViewBox(svg: Element): string {
  if (svg.attribs.viewBox || svg.attribs.viewbox) {
    return svg.attribs.viewBox || svg.attribs.viewbox;
  }

  const w = svg.attribs.width;
  const h = svg.attribs.height;
  if (w && h) {
    const width = parseFloat(w);
    const height = parseFloat(h);
    if (!isNaN(width) && !isNaN(height)) {
      return `0 0 ${width} ${height}`;
    }
  }

  return "0 0 24 24";
}

/**
 * Returns the natural width/height of the SVG as display strings.
 * Prefers explicit width/height attrs; falls back to the viewBox dimensions.
 * Strips units (px, pt, etc.) and large export sizes like 512 → uses viewBox.
 */
function extractDimensions(
  svg: Element,
  viewBox: string,
): { width: string; height: string } {
  const vbParts = viewBox.split(/\s+/);
  const vbW = vbParts[2] ?? "24";
  const vbH = vbParts[3] ?? "24";

  const rawW = svg.attribs.width;
  const rawH = svg.attribs.height;

  if (rawW && rawH) {
    const w = parseFloat(rawW);
    const h = parseFloat(rawH);
    // Ignore large "export" sizes (e.g. width="512") — use viewBox instead
    if (!isNaN(w) && !isNaN(h) && w <= 100 && h <= 100) {
      return { width: String(w), height: String(h) };
    }
  }

  return { width: vbW, height: vbH };
}

// ---------------------------------------------------------------------------
// Color detection
// ---------------------------------------------------------------------------

const FILL_RECEIVING_TAGS = new Set([
  "path", "circle", "ellipse", "rect", "polygon", "polyline",
  "line", "text", "tspan", "use", "g",
]);

/**
 * Returns true if any element in the tree will visually receive a color —
 * either via an explicit replaceable fill/stroke attr, or via implicit fill
 * (element has no fill attr, meaning it inherits the default black fill).
 */
function treeNeedsColor(el: Element): boolean {
  for (const child of el.children) {
    if (!isTag(child)) continue;
    if (SKIP_TAGS.has(child.name)) continue;
    if (elementNeedsColor(child)) return true;
    if (treeNeedsColor(child)) return true;
  }
  return false;
}

function elementNeedsColor(el: Element): boolean {
  // Explicit replaceable color attr (e.g. fill="#000", stroke="red")
  for (const [attr, value] of Object.entries(el.attribs)) {
    if (isColorAttr(attr) && isReplaceableColor(value)) return true;
  }

  // No fill attr on a shape element → implicit black fill → needs color
  if (FILL_RECEIVING_TAGS.has(el.name) && !("fill" in el.attribs)) {
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// JSX serialisation
// ---------------------------------------------------------------------------

function nodeToJsx(
  node: ChildNode,
  replaceColors: boolean,
  indent: number,
): string {
  if (isText(node)) {
    const text = node.data.trim();
    if (!text) return "";
    return pad(indent) + text;
  }

  if (!isTag(node)) return "";

  if (SKIP_TAGS.has(node.name)) return "";

  const tag = node.name;
  const attrs = buildAttrs(node.name, node.attribs, replaceColors);
  const children = node.children
    .map((child) => nodeToJsx(child, replaceColors, indent + 1))
    .filter(Boolean);

  if (children.length === 0) {
    return `${pad(indent)}<${tag}${attrs} />`;
  }

  return [
    `${pad(indent)}<${tag}${attrs}>`,
    ...children,
    `${pad(indent)}</${tag}>`,
  ].join("\n");
}

const SKIP_TAGS = new Set([
  "title",
  "desc",
  "defs",
  "metadata",
  "style",
  "comment",
]);

function buildAttrs(
  tagName: string,
  attribs: Record<string, string>,
  replaceColors: boolean,
): string {
  const parts: string[] = [];
  let hasFill = false;

  for (const [rawAttr, value] of Object.entries(attribs)) {
    if (shouldSkipAttr(rawAttr)) continue;
    if (rawAttr === "fill") hasFill = true;
    const jsxAttr = svgAttrToJsx(rawAttr);
    const jsxValue = formatJsxValue(rawAttr, value, replaceColors);
    parts.push(`${jsxAttr}=${jsxValue}`);
  }

  // Inject fill={color} for shape elements with no fill attr when replacing colors
  if (replaceColors && !hasFill && FILL_RECEIVING_TAGS.has(tagName)) {
    parts.push("fill={color}");
  }

  if (parts.length === 0) return "";
  return " " + parts.join(" ");
}

function svgHasReplaceableColors(el: Element): boolean {
  for (const [attr, value] of Object.entries(el.attribs)) {
    if (isColorAttr(attr) && isReplaceableColor(value)) return true;
  }
  for (const child of el.children) {
    if (isTag(child) && svgHasReplaceableColors(child)) return true;
  }
  return false;
}

function pad(level: number): string {
  return "  ".repeat(level);
}

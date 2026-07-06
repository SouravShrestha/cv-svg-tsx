import path from "node:path";

export function fileNameToComponentName(
  filePath: string,
  suffix: string,
): string {
  const base = path.basename(filePath, path.extname(filePath));
  const pascal = toPascalCase(base);
  return pascal + suffix;
}

export function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

const SVG_TO_JSX: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  "xlink:href": "xlinkHref",
  "xlink:actuate": "xlinkActuate",
  "xlink:arcrole": "xlinkArcrole",
  "xlink:role": "xlinkRole",
  "xlink:show": "xlinkShow",
  "xlink:title": "xlinkTitle",
  "xlink:type": "xlinkType",
  "xml:base": "xmlBase",
  "xml:lang": "xmlLang",
  "xml:space": "xmlSpace",
  "clip-path": "clipPath",
  "clip-rule": "clipRule",
  "fill-opacity": "fillOpacity",
  "fill-rule": "fillRule",
  "flood-color": "floodColor",
  "flood-opacity": "floodOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-style": "fontStyle",
  "font-weight": "fontWeight",
  "letter-spacing": "letterSpacing",
  "lighting-color": "lightingColor",
  "marker-end": "markerEnd",
  "marker-mid": "markerMid",
  "marker-start": "markerStart",
  "paint-order": "paintOrder",
  "pointer-events": "pointerEvents",
  "shape-rendering": "shapeRendering",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-opacity": "strokeOpacity",
  "stroke-width": "strokeWidth",
  "text-anchor": "textAnchor",
  "text-decoration": "textDecoration",
  "text-rendering": "textRendering",
  "dominant-baseline": "dominantBaseline",
  "alignment-baseline": "alignmentBaseline",
  "baseline-shift": "baselineShift",
  "color-interpolation": "colorInterpolation",
  "color-interpolation-filters": "colorInterpolationFilters",
  "enable-background": "enableBackground",
  "glyph-orientation-horizontal": "glyphOrientationHorizontal",
  "glyph-orientation-vertical": "glyphOrientationVertical",
  "image-rendering": "imageRendering",
  "word-spacing": "wordSpacing",
  "writing-mode": "writingMode",
};

export function svgAttrToJsx(attr: string): string {
  if (SVG_TO_JSX[attr]) return SVG_TO_JSX[attr];
  if (attr.includes("-")) {
    return attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }
  return attr;
}

const SKIP_ATTRS = new Set([
  "xmlns",
  "xmlns:xlink",
  "xmlnsXlink",
  "version",
]);

export function shouldSkipAttr(attr: string): boolean {
  return SKIP_ATTRS.has(attr);
}

const COLOR_ATTRS = new Set([
  "fill",
  "stroke",
  "stop-color",
  "flood-color",
  "lighting-color",
  "color",
]);

export function isColorAttr(attr: string): boolean {
  return COLOR_ATTRS.has(attr);
}

const PRESERVE_VALUES = new Set([
  "none",
  "inherit",
  "currentColor",
  "transparent",
]);

export function isReplaceableColor(value: string): boolean {
  if (PRESERVE_VALUES.has(value)) return false;
  if (value.startsWith("url(")) return false;
  return true;
}

export function formatJsxValue(
  attr: string,
  value: string,
  replaceColors: boolean,
): string {
  if (replaceColors && isColorAttr(attr) && isReplaceableColor(value)) {
    return "{color}";
  }

  if (/^\d+(\.\d+)?$/.test(value)) {
    return `{${value}}`;
  }

  return `"${value}"`;
}

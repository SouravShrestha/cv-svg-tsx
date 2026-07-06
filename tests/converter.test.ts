import { describe, it, expect } from "vitest";
import { convertSvgString } from "../src/converter.js";
import type { ConvertOptions } from "../src/types.js";

const defaultOptions: ConvertOptions = {
  suffix: "Icon",
  keepColors: false,
  ariaHidden: true,
  defaultColor: "currentColor",
};

describe("convertSvgString", () => {
  it("converts a complete SVG to TSX", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14" stroke="#000" stroke-width="2" stroke-linecap="round"/>
      <path d="M5 12l7-7 7 7" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const result = convertSvgString(svg, "arrow-up.svg", defaultOptions);

    expect(result.componentName).toBe("ArrowUpIcon");
    expect(result.outputFileName).toBe("ArrowUpIcon.tsx");
    expect(result.tsx).toContain("export function ArrowUpIcon");
    expect(result.tsx).toContain("stroke={color}");
    expect(result.tsx).toContain("strokeWidth={2}");
    expect(result.tsx).toContain("strokeLinecap=");
    expect(result.tsx).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("always emits color prop", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <path d="M12 5v14"/>
    </svg>`;

    const result = convertSvgString(svg, "line.svg", defaultOptions);
    expect(result.tsx).toContain("color?: string;");
    expect(result.tsx).toContain('color = "currentColor"');
  });

  it("preserves colors with keepColors option", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#ff0000"/>
    </svg>`;

    const result = convertSvgString(svg, "dot.svg", {
      ...defaultOptions,
      keepColors: true,
    });

    expect(result.tsx).toContain('fill="#ff0000"');
    expect(result.tsx).not.toContain("fill={color}");
  });

  it("uses custom suffix", () => {
    const svg = `<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>`;

    const result = convertSvgString(svg, "arrow.svg", {
      ...defaultOptions,
      suffix: "",
    });

    expect(result.componentName).toBe("Arrow");
    expect(result.outputFileName).toBe("Arrow.tsx");
  });

  it("uses custom default color", () => {
    const svg = `<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>`;

    const result = convertSvgString(svg, "icon.svg", {
      ...defaultOptions,
      defaultColor: "white",
    });

    expect(result.tsx).toContain('color = "white"');
  });

  it("handles multi-color SVG", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <path d="M0 0" fill="#ff0000"/>
      <path d="M0 0" fill="#00ff00"/>
      <path d="M0 0" stroke="#0000ff"/>
    </svg>`;

    const result = convertSvgString(svg, "multi.svg", defaultOptions);

    expect(result.tsx).toContain("color?: string;");
    expect(result.tsx).toContain("fill={color}");
    expect(result.tsx).toContain("stroke={color}");
  });

  it("injects fill={color} on path with no fill attr", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <path d="M12 5v14"/>
    </svg>`;

    const result = convertSvgString(svg, "implicit.svg", defaultOptions);
    expect(result.tsx).toContain("fill={color}");
  });

  it("uses natural SVG dimensions for width/height", () => {
    const svg = `<svg viewBox="0 0 24 20" width="512" height="512">
      <path d="M0 0"/>
    </svg>`;

    const result = convertSvgString(svg, "wide.svg", defaultOptions);
    expect(result.tsx).toContain('width="24"');
    expect(result.tsx).toContain('height="20"');
  });
});

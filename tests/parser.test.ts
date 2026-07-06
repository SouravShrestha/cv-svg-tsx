import { describe, it, expect } from "vitest";
import { parseSvg } from "../src/parser.js";

describe("parseSvg", () => {
  it("parses basic SVG with explicit colors", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12 5v14" stroke="#000" stroke-width="2"/>
    </svg>`;

    const result = parseSvg(svg, true);
    expect(result.viewBox).toBe("0 0 24 24");
    expect(result.children).toContain("stroke={color}");
    expect(result.children).toContain('d="M12 5v14"');
    expect(result.children).toContain("strokeWidth={2}");
    expect(result.hasColorProps).toBe(true);
  });

  it("detects implicit fill (no fill attr on path) as needing color", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <path d="M0 0"/>
    </svg>`;

    const result = parseSvg(svg, true);
    expect(result.hasColorProps).toBe(true);
    expect(result.children).toContain("fill={color}");
  });

  it("does not inject fill={color} when replaceColors is false", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <path d="M0 0"/>
    </svg>`;

    const result = parseSvg(svg, false);
    expect(result.hasColorProps).toBe(false);
    expect(result.children).not.toContain("fill={color}");
  });

  it("extracts viewBox from width/height when viewBox is missing", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
      <circle cx="16" cy="16" r="8" fill="red"/>
    </svg>`;

    const result = parseSvg(svg, true);
    expect(result.viewBox).toBe("0 0 32 32");
  });

  it("defaults viewBox to 0 0 24 24", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg">
      <rect fill="#333"/>
    </svg>`;

    const result = parseSvg(svg, true);
    expect(result.viewBox).toBe("0 0 24 24");
  });

  it("uses viewBox dimensions when width/height are large export sizes", () => {
    const svg = `<svg viewBox="0 0 24 24" width="512" height="512">
      <path d="M0 0"/>
    </svg>`;

    const result = parseSvg(svg, true);
    expect(result.width).toBe("24");
    expect(result.height).toBe("24");
  });

  it("uses small explicit width/height as natural dimensions", () => {
    const svg = `<svg viewBox="0 0 24 20" width="24" height="20">
      <path d="M0 0"/>
    </svg>`;

    const result = parseSvg(svg, true);
    expect(result.width).toBe("24");
    expect(result.height).toBe("20");
  });

  it("strips xmlns attributes from children", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
      <path d="M0 0"/>
    </svg>`;

    const result = parseSvg(svg, false);
    expect(result.children).not.toContain("xmlns");
  });

  it("preserves none fill values", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <path d="M0 0" fill="none" stroke="#000"/>
    </svg>`;

    const result = parseSvg(svg, true);
    expect(result.children).toContain('fill="none"');
    expect(result.children).toContain("stroke={color}");
  });

  it("preserves url references", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <path d="M0 0" fill="url(#gradient)"/>
    </svg>`;

    const result = parseSvg(svg, true);
    expect(result.children).toContain('fill="url(#gradient)"');
  });

  it("keeps colors when replaceColors is false", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <path d="M0 0" fill="#ff0000" stroke="blue"/>
    </svg>`;

    const result = parseSvg(svg, false);
    expect(result.children).toContain('fill="#ff0000"');
    expect(result.children).toContain('stroke="blue"');
    expect(result.hasColorProps).toBe(false);
  });

  it("handles nested elements", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <g>
        <path d="M0 0" fill="#000"/>
        <circle cx="12" cy="12" r="4" fill="#fff"/>
      </g>
    </svg>`;

    const result = parseSvg(svg, true);
    expect(result.children).toContain("<g");
    expect(result.children).toContain("</g>");
    expect(result.hasColorProps).toBe(true);
  });

  it("converts SVG attributes to JSX camelCase", () => {
    const svg = `<svg viewBox="0 0 24 24">
      <path d="M0 0" stroke-width="2" stroke-linecap="round" fill-rule="evenodd"/>
    </svg>`;

    const result = parseSvg(svg, false);
    expect(result.children).toContain("strokeWidth=");
    expect(result.children).toContain("strokeLinecap=");
    expect(result.children).toContain("fillRule=");
    expect(result.children).not.toContain("stroke-width");
  });

  it("throws for invalid input without svg element", () => {
    expect(() => parseSvg("<div>not svg</div>", false)).toThrow(
      "No <svg> element found",
    );
  });

  it("detects hasColorProps correctly for explicit colors", () => {
    const noColors = `<svg viewBox="0 0 24 24">
      <path d="M0 0" fill="none"/>
    </svg>`;
    expect(parseSvg(noColors, true).hasColorProps).toBe(false);

    const withColors = `<svg viewBox="0 0 24 24">
      <path d="M0 0" fill="#000"/>
    </svg>`;
    expect(parseSvg(withColors, true).hasColorProps).toBe(true);
  });
});

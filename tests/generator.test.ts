import { describe, it, expect } from "vitest";
import { generateTsx } from "../src/generator.js";
import type { ParsedSvg, ConvertOptions } from "../src/types.js";

const defaultOptions: ConvertOptions = {
  suffix: "Icon",
  keepColors: false,
  ariaHidden: true,
  defaultColor: "currentColor",
};

describe("generateTsx", () => {
  it("generates a complete component with color prop", () => {
    const parsed: ParsedSvg = {
      viewBox: "0 0 24 24",
      width: "24",
      height: "24",
      children: '      <path d="M12 5v14" stroke={color} strokeWidth={2} />',
      hasColorProps: true,
    };

    const result = generateTsx("ArrowIcon", parsed, defaultOptions);

    expect(result).toContain('import type { SVGProps } from "react"');
    expect(result).toContain("type Props = SVGProps<SVGSVGElement> & {");
    expect(result).toContain("color?: string;");
    expect(result).toContain('export function ArrowIcon(');
    expect(result).toContain('color = "currentColor"');
    expect(result).toContain("...props");
    expect(result).toContain('width="24"');
    expect(result).toContain('height="24"');
    expect(result).toContain('viewBox="0 0 24 24"');
    expect(result).toContain('fill="none"');
    expect(result).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(result).toContain('aria-hidden="true"');
    expect(result).toContain("{...props}");
  });

  it("always emits color prop even when hasColorProps is false", () => {
    const parsed: ParsedSvg = {
      viewBox: "0 0 24 24",
      width: "24",
      height: "24",
      children: '      <path d="M12 5v14" fill="none" />',
      hasColorProps: false,
    };

    const result = generateTsx("ArrowIcon", parsed, defaultOptions);

    // color prop is always present
    expect(result).toContain("color?: string;");
    expect(result).toContain('color = "currentColor"');
    // no size prop
    expect(result).not.toContain("size");
  });

  it("uses custom default color", () => {
    const parsed: ParsedSvg = {
      viewBox: "0 0 24 24",
      width: "24",
      height: "24",
      children: "",
      hasColorProps: true,
    };

    const result = generateTsx("BoxIcon", parsed, {
      ...defaultOptions,
      defaultColor: "white",
    });

    expect(result).toContain('color = "white"');
  });

  it("omits aria-hidden when option is false", () => {
    const parsed: ParsedSvg = {
      viewBox: "0 0 24 24",
      width: "24",
      height: "24",
      children: "",
      hasColorProps: false,
    };

    const result = generateTsx("TestIcon", parsed, {
      ...defaultOptions,
      ariaHidden: false,
    });

    expect(result).not.toContain("aria-hidden");
  });

  it("uses natural width and height from parsed SVG", () => {
    const parsed: ParsedSvg = {
      viewBox: "0 0 24 20",
      width: "24",
      height: "20",
      children: "",
      hasColorProps: false,
    };

    const result = generateTsx("WideIcon", parsed, defaultOptions);
    expect(result).toContain('width="24"');
    expect(result).toContain('height="20"');
    expect(result).toContain('viewBox="0 0 24 20"');
  });
});

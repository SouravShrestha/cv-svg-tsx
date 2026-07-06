import { describe, it, expect } from "vitest";
import {
  fileNameToComponentName,
  toPascalCase,
  svgAttrToJsx,
  shouldSkipAttr,
  isColorAttr,
  isReplaceableColor,
  formatJsxValue,
} from "../src/utils.js";

describe("toPascalCase", () => {
  it("converts kebab-case", () => {
    expect(toPascalCase("arrow-left")).toBe("ArrowLeft");
  });

  it("converts snake_case", () => {
    expect(toPascalCase("arrow_left")).toBe("ArrowLeft");
  });

  it("converts space-separated", () => {
    expect(toPascalCase("arrow left")).toBe("ArrowLeft");
  });

  it("handles single word", () => {
    expect(toPascalCase("arrow")).toBe("Arrow");
  });

  it("handles mixed delimiters", () => {
    expect(toPascalCase("my-cool_icon 2")).toBe("MyCoolIcon2");
  });

  it("handles already PascalCase", () => {
    expect(toPascalCase("ArrowLeft")).toBe("Arrowleft");
  });
});

describe("fileNameToComponentName", () => {
  it("converts filename with Icon suffix", () => {
    expect(fileNameToComponentName("arrow-left.svg", "Icon")).toBe(
      "ArrowLeftIcon",
    );
  });

  it("handles path with directories", () => {
    expect(fileNameToComponentName("/icons/chevron-down.svg", "Icon")).toBe(
      "ChevronDownIcon",
    );
  });

  it("works with empty suffix", () => {
    expect(fileNameToComponentName("arrow.svg", "")).toBe("Arrow");
  });

  it("handles underscores in filename", () => {
    expect(fileNameToComponentName("close_button.svg", "Icon")).toBe(
      "CloseButtonIcon",
    );
  });
});

describe("svgAttrToJsx", () => {
  it("converts known SVG attributes", () => {
    expect(svgAttrToJsx("stroke-width")).toBe("strokeWidth");
    expect(svgAttrToJsx("fill-rule")).toBe("fillRule");
    expect(svgAttrToJsx("clip-path")).toBe("clipPath");
    expect(svgAttrToJsx("stroke-linecap")).toBe("strokeLinecap");
  });

  it("converts class to className", () => {
    expect(svgAttrToJsx("class")).toBe("className");
  });

  it("converts xlink:href", () => {
    expect(svgAttrToJsx("xlink:href")).toBe("xlinkHref");
  });

  it("passes through non-hyphenated attrs", () => {
    expect(svgAttrToJsx("viewBox")).toBe("viewBox");
    expect(svgAttrToJsx("d")).toBe("d");
    expect(svgAttrToJsx("fill")).toBe("fill");
  });

  it("converts unknown hyphenated attrs to camelCase", () => {
    expect(svgAttrToJsx("data-name")).toBe("dataName");
  });
});

describe("shouldSkipAttr", () => {
  it("skips xmlns", () => {
    expect(shouldSkipAttr("xmlns")).toBe(true);
  });

  it("skips xmlns:xlink", () => {
    expect(shouldSkipAttr("xmlns:xlink")).toBe(true);
  });

  it("keeps normal attrs", () => {
    expect(shouldSkipAttr("fill")).toBe(false);
    expect(shouldSkipAttr("viewBox")).toBe(false);
  });
});

describe("isColorAttr", () => {
  it("identifies color attributes", () => {
    expect(isColorAttr("fill")).toBe(true);
    expect(isColorAttr("stroke")).toBe(true);
    expect(isColorAttr("stop-color")).toBe(true);
  });

  it("rejects non-color attributes", () => {
    expect(isColorAttr("d")).toBe(false);
    expect(isColorAttr("viewBox")).toBe(false);
    expect(isColorAttr("stroke-width")).toBe(false);
  });
});

describe("isReplaceableColor", () => {
  it("replaces hex colors", () => {
    expect(isReplaceableColor("#000")).toBe(true);
    expect(isReplaceableColor("#ff0000")).toBe(true);
  });

  it("replaces named colors", () => {
    expect(isReplaceableColor("red")).toBe(true);
    expect(isReplaceableColor("blue")).toBe(true);
  });

  it("replaces rgb values", () => {
    expect(isReplaceableColor("rgb(0,0,0)")).toBe(true);
  });

  it("preserves none", () => {
    expect(isReplaceableColor("none")).toBe(false);
  });

  it("preserves currentColor", () => {
    expect(isReplaceableColor("currentColor")).toBe(false);
  });

  it("preserves inherit", () => {
    expect(isReplaceableColor("inherit")).toBe(false);
  });

  it("preserves transparent", () => {
    expect(isReplaceableColor("transparent")).toBe(false);
  });

  it("preserves url references", () => {
    expect(isReplaceableColor("url(#gradient)")).toBe(false);
  });
});

describe("formatJsxValue", () => {
  it("replaces color values when replaceColors is true", () => {
    expect(formatJsxValue("fill", "#000", true)).toBe("{color}");
    expect(formatJsxValue("stroke", "red", true)).toBe("{color}");
  });

  it("preserves color values when replaceColors is false", () => {
    expect(formatJsxValue("fill", "#000", false)).toBe('"#000"');
  });

  it("preserves none even with replaceColors", () => {
    expect(formatJsxValue("fill", "none", true)).toBe('"none"');
  });

  it("formats numeric values as expressions", () => {
    expect(formatJsxValue("strokeWidth", "2", false)).toBe("{2}");
    expect(formatJsxValue("strokeWidth", "1.5", false)).toBe("{1.5}");
  });

  it("formats string values with quotes", () => {
    expect(formatJsxValue("d", "M0 0L10 10", false)).toBe('"M0 0L10 10"');
  });
});

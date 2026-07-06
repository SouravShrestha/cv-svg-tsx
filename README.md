# cv-svg-tsx

CLI to convert SVG files into ready-to-use TSX React components with a tintable `color` prop, natural dimensions, and full TypeScript types.

## Install

```bash
npm install -g cv-svg-tsx
```

Or run without installing:

```bash
npx cv-svg-tsx arrow.svg
```

## Usage

```bash
cv-svg-tsx [options] <input...>
```

**Arguments:**

| Argument | Description                       |
| -------- | --------------------------------- |
| `input`  | SVG file(s) or folder path(s)     |

**Options:**

| Option                      | Default          | Description                                    |
| --------------------------- | ---------------- | ---------------------------------------------- |
| `-o, --output <dir>`        | `.`              | Output directory                               |
| `--suffix <string>`         | `Icon`           | Component name suffix                          |
| `--default-color <string>`  | `currentColor`   | Default value for the `color` prop             |
| `--keep-colors`             |                  | Preserve original SVG colors as-is             |
| `--no-aria-hidden`          |                  | Don't add `aria-hidden="true"` to the SVG      |
| `-f, --force`               |                  | Overwrite existing files                       |
| `-V, --version`             |                  | Output version number                          |
| `-h, --help`                |                  | Display help                                   |

## Examples

Convert a single SVG:

```bash
cv-svg-tsx arrow.svg
# → ArrowIcon.tsx
```

Convert all SVGs in a folder:

```bash
cv-svg-tsx ./icons/ -o ./src/components/icons
# → ArrowLeftIcon.tsx, ChevronDownIcon.tsx, ...
```

Multiple inputs to a specific output directory:

```bash
cv-svg-tsx arrow.svg chevron.svg -o ./src/components/icons
```

No suffix, custom default color:

```bash
cv-svg-tsx arrow.svg --suffix "" --default-color white
# → Arrow.tsx with color defaulting to "white"
```

Keep original colors instead of replacing them with `color`:

```bash
cv-svg-tsx logo.svg --keep-colors
```

## Output Format

Given `arrow-left.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M19 12H5" stroke="#000" stroke-width="2" stroke-linecap="round"/>
  <path d="M12 19l-7-7 7-7" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

Generates `ArrowLeftIcon.tsx`:

```tsx
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  color?: string;
};

export function ArrowLeftIcon({ color = "currentColor", ...props }: Props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 12H5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

### Using the generated component

```tsx
import { ArrowLeftIcon } from "./ArrowLeftIcon";

// Uses currentColor — inherits text color from parent
<ArrowLeftIcon />

// Explicit color
<ArrowLeftIcon color="#3b82f6" />

// Override size via width/height SVG props
<ArrowLeftIcon width={32} height={32} />

// Any standard SVG prop passes through
<ArrowLeftIcon className="icon" aria-label="Go back" aria-hidden="false" />
```

## Color Handling

Every generated component has a `color` prop (default: `"currentColor"`). It is applied to elements in two ways:

**Explicit colors** — `fill`, `stroke`, `stop-color`, `flood-color`, and `lighting-color` attributes whose values are actual colors (hex, named, rgb, etc.) are replaced with `{color}`:

```svg
<!-- input -->
<path fill="#1a1a1a" />
```
```tsx
// output
<path fill={color} />
```

**Implicit fills** — shape elements (`path`, `circle`, `rect`, `ellipse`, etc.) with no `fill` attribute at all rely on the browser default (black). These also receive `fill={color}` so they remain tintable:

```svg
<!-- input: no fill attr -->
<path d="M12 5v14" />
```
```tsx
// output
<path d="M12 5v14" fill={color} />
```

These values are **always preserved** as-is:

| Value          | Reason                              |
| -------------- | ----------------------------------- |
| `none`         | Intentionally invisible             |
| `currentColor` | Already dynamic                     |
| `inherit`      | CSS-inherited                       |
| `transparent`  | CSS-inherited                       |
| `url(#...)`    | Gradient or pattern reference       |

Use `--keep-colors` to skip all replacement and preserve the original values.

## Dimensions

`width` and `height` on the `<svg>` element are set to the SVG's natural dimensions:

- If the SVG has `width`/`height` attributes ≤ 100, those values are used directly.
- Otherwise (e.g. export sizes like `width="512"`), the dimensions are derived from `viewBox`.
- If no `viewBox` is present, it defaults to `0 0 24 24`.

To override size at the call site, pass `width` and `height` as props — they spread onto the `<svg>` via `{...props}`.

## License

MIT

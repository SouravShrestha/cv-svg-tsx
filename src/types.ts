export interface ConvertOptions {
  suffix: string;
  keepColors: boolean;
  ariaHidden: boolean;
  defaultColor: string;
}

export interface ConvertResult {
  componentName: string;
  outputFileName: string;
  tsx: string;
}

export interface ParsedSvg {
  viewBox: string;
  width: string;
  height: string;
  children: string;
  hasColorProps: boolean;
}

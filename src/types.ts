export type XliffVersion = "1.2" | "2.0";

export type TranslationState = "initial" | "translated" | "reviewed" | "final";

export interface TranslationUnit {
  id: string;
  source: string;
  target?: string;
  state?: TranslationState;
  note?: string;
}

export interface TranslationFile {
  id: string;
  sourceLanguage: string;
  targetLanguage?: string;
  original?: string;
  datatype?: string;
  date?: string;
  productName?: string;
  units: TranslationUnit[];
}

export interface XliffDocument {
  version: XliffVersion;
  files: TranslationFile[];
}

export interface WriterOptions {
  format?: boolean;
  indent?: string;
  suppressXmlDeclaration?: boolean;
  ignoreAttributes?: boolean;
  attributeNamePrefix?: string;
}

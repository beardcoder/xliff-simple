import { XMLParser } from "fast-xml-parser";
import type {
  XliffDocument,
  TranslationFile,
  TranslationUnit,
  TranslationState,
} from "./types.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: false,
});

function normalizeToArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseXliff12(parsed: any): XliffDocument {
  const xliffRoot = parsed.xliff;
  const files = normalizeToArray(xliffRoot.file);

  return {
    version: "1.2",
    files: files.map((file): TranslationFile => {
      const transUnits = normalizeToArray(file.body?.["trans-unit"]);

      return {
        id: file["@_original"] || "default",
        sourceLanguage: file["@_source-language"] || "",
        targetLanguage: file["@_target-language"],
        original: file["@_original"],
        datatype: file["@_datatype"],
        date: file["@_date"],
        productName: file["@_product-name"],
        units: transUnits.map(
          (unit): TranslationUnit => ({
            id: unit["@_id"] || "",
            source: unit.source || "",
            target: unit.target,
            state: unit["@_approved"] === "yes" ? "final" : "initial",
            note: unit.note,
          })
        ),
      };
    }),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseXliff20(parsed: any): XliffDocument {
  const xliffRoot = parsed.xliff;
  const files = normalizeToArray(xliffRoot.file);

  return {
    version: "2.0",
    files: files.map((file): TranslationFile => {
      const units = normalizeToArray(file.unit);

      return {
        id: file["@_id"] || "default",
        sourceLanguage: xliffRoot["@_srcLang"] || "",
        targetLanguage: xliffRoot["@_trgLang"],
        units: units.map((unit): TranslationUnit => {
          const segment = unit.segment || {};

          return {
            id: unit["@_id"] || "",
            source: segment.source || "",
            target: segment.target,
            state: segment["@_state"] as TranslationState | undefined,
            note: unit.notes?.note,
          };
        }),
      };
    }),
  };
}

export function parse(xmlContent: string): XliffDocument {
  const parsed = parser.parse(xmlContent);

  if (!parsed.xliff) {
    throw new Error("Invalid XLIFF: missing xliff root element");
  }

  const version = parsed.xliff["@_version"];

  if (version === "1.2") {
    return parseXliff12(parsed);
  } else if (version === "2.0") {
    return parseXliff20(parsed);
  } else {
    throw new Error(`Unsupported XLIFF version: ${version}`);
  }
}

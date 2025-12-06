import { XMLBuilder } from "fast-xml-parser";
import type { XliffDocument, XliffVersion, WriterOptions } from "./types.js";

const defaultOptions: Required<WriterOptions> = {
  format: true,
  indent: "    ",
  suppressXmlDeclaration: false,
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
};

function buildXliff12(
  doc: XliffDocument,
  suppressXmlDeclaration: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const xliffContent = {
    "@_version": "1.2",
    "@_xmlns": "urn:oasis:names:tc:xliff:document:1.2",
    file: doc.files.map((file) => ({
      "@_source-language": file.sourceLanguage,
      ...(file.targetLanguage && { "@_target-language": file.targetLanguage }),
      ...(file.datatype && { "@_datatype": file.datatype }),
      ...(file.original && { "@_original": file.original }),
      ...(file.date && { "@_date": file.date }),
      ...(file.productName && { "@_product-name": file.productName }),
      header: {},
      body: {
        "trans-unit": file.units.map((unit) => ({
          "@_id": unit.id,
          ...(unit.state === "final" && { "@_approved": "yes" }),
          source: unit.source,
          ...(unit.target && { target: unit.target }),
          ...(unit.note && { note: unit.note }),
        })),
      },
    })),
  };

  if (suppressXmlDeclaration) {
    return { xliff: xliffContent };
  }

  return {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "UTF-8",
    },
    xliff: xliffContent,
  };
}

function buildXliff20(
  doc: XliffDocument,
  suppressXmlDeclaration: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const xliffContent = {
    "@_version": "2.0",
    "@_xmlns": "urn:oasis:names:tc:xliff:document:2.0",
    "@_srcLang": doc.files[0]?.sourceLanguage || "en",
    ...(doc.files[0]?.targetLanguage && {
      "@_trgLang": doc.files[0].targetLanguage,
    }),
    file: doc.files.map((file) => ({
      "@_id": file.id,
      unit: file.units.map((unit) => ({
        "@_id": unit.id,
        segment: {
          ...(unit.state && { "@_state": unit.state }),
          source: unit.source,
          ...(unit.target && { target: unit.target }),
        },
        ...(unit.note && { notes: { note: unit.note } }),
      })),
    })),
  };

  if (suppressXmlDeclaration) {
    return { xliff: xliffContent };
  }

  return {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "UTF-8",
    },
    xliff: xliffContent,
  };
}

export function write(
  doc: XliffDocument,
  targetVersion?: XliffVersion,
  options?: WriterOptions
): string {
  const opts = { ...defaultOptions, ...options };

  const builder = new XMLBuilder({
    ignoreAttributes: opts.ignoreAttributes,
    attributeNamePrefix: opts.attributeNamePrefix,
    format: opts.format,
    indentBy: opts.indent,
    suppressEmptyNode: true,
  });

  const version = targetVersion || doc.version;
  const obj =
    version === "1.2"
      ? buildXliff12(doc, opts.suppressXmlDeclaration)
      : buildXliff20(doc, opts.suppressXmlDeclaration);

  return builder.build(obj);
}

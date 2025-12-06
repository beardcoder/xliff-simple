import { describe, test, expect } from "bun:test";
import { validate } from "./validator.js";
import type { XliffDocument } from "./types.js";

describe("XLIFF Validator", () => {
  test("validates a valid document", () => {
    const doc: XliffDocument = {
      version: "1.2",
      files: [
        {
          id: "f1",
          sourceLanguage: "en",
          units: [
            {
              id: "key1",
              source: "Hello World",
            },
          ],
        },
      ],
    };

    const result = validate(doc);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("detects missing files", () => {
    const doc: XliffDocument = {
      version: "1.2",
      files: [],
    };

    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.message).toContain("at least one file");
  });

  test("detects missing source language", () => {
    const doc: XliffDocument = {
      version: "1.2",
      files: [
        {
          id: "f1",
          sourceLanguage: "",
          units: [
            {
              id: "key1",
              source: "Hello",
            },
          ],
        },
      ],
    };

    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.message.includes("source language"))
    ).toBe(true);
  });

  test("detects missing translation units", () => {
    const doc: XliffDocument = {
      version: "1.2",
      files: [
        {
          id: "f1",
          sourceLanguage: "en",
          units: [],
        },
      ],
    };

    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) =>
        e.message.includes("at least one translation unit")
      )
    ).toBe(true);
  });

  test("detects missing unit ID", () => {
    const doc: XliffDocument = {
      version: "1.2",
      files: [
        {
          id: "f1",
          sourceLanguage: "en",
          units: [
            {
              id: "",
              source: "Hello",
            },
          ],
        },
      ],
    };

    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.message.includes("must have an ID"))
    ).toBe(true);
  });

  test("detects duplicate unit IDs", () => {
    const doc: XliffDocument = {
      version: "1.2",
      files: [
        {
          id: "f1",
          sourceLanguage: "en",
          units: [
            {
              id: "key1",
              source: "Hello",
            },
            {
              id: "key1",
              source: "World",
            },
          ],
        },
      ],
    };

    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("Duplicate"))).toBe(
      true
    );
  });

  test("detects missing source text", () => {
    const doc: XliffDocument = {
      version: "1.2",
      files: [
        {
          id: "f1",
          sourceLanguage: "en",
          units: [
            {
              id: "key1",
              source: "",
            },
          ],
        },
      ],
    };

    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.message.includes("must have source text"))
    ).toBe(true);
  });

  test("detects target without target language", () => {
    const doc: XliffDocument = {
      version: "1.2",
      files: [
        {
          id: "f1",
          sourceLanguage: "en",
          units: [
            {
              id: "key1",
              source: "Hello",
              target: "Hallo",
            },
          ],
        },
      ],
    };

    const result = validate(doc);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.message.includes("no target language"))
    ).toBe(true);
  });

  test("allows target with target language", () => {
    const doc: XliffDocument = {
      version: "1.2",
      files: [
        {
          id: "f1",
          sourceLanguage: "en",
          targetLanguage: "de",
          units: [
            {
              id: "key1",
              source: "Hello",
              target: "Hallo",
            },
          ],
        },
      ],
    };

    const result = validate(doc);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("validates multiple files", () => {
    const doc: XliffDocument = {
      version: "2.0",
      files: [
        {
          id: "f1",
          sourceLanguage: "en",
          units: [
            {
              id: "key1",
              source: "Hello",
            },
          ],
        },
        {
          id: "f2",
          sourceLanguage: "fr",
          units: [
            {
              id: "key1",
              source: "Bonjour",
            },
          ],
        },
      ],
    };

    const result = validate(doc);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

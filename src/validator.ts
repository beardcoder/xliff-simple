import type { XliffDocument } from "./types.js";

export interface ValidationError {
  message: string;
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validate(doc: XliffDocument): ValidationResult {
  const errors: ValidationError[] = [];

  if (!doc.files || doc.files.length === 0) {
    errors.push({ message: "Document must contain at least one file" });
    return { valid: false, errors };
  }

  for (let fileIndex = 0; fileIndex < doc.files.length; fileIndex++) {
    const file = doc.files[fileIndex];
    if (!file) continue;

    const filePath = `files[${fileIndex}]`;

    if (!file.sourceLanguage || file.sourceLanguage.trim() === "") {
      errors.push({
        message: "File must have a source language",
        path: `${filePath}.sourceLanguage`,
      });
    }

    if (!file.units || file.units.length === 0) {
      errors.push({
        message: "File must contain at least one translation unit",
        path: `${filePath}.units`,
      });
      continue;
    }

    const unitIds = new Set<string>();

    for (let unitIndex = 0; unitIndex < file.units.length; unitIndex++) {
      const unit = file.units[unitIndex];
      if (!unit) continue;

      const unitPath = `${filePath}.units[${unitIndex}]`;

      if (!unit.id || unit.id.trim() === "") {
        errors.push({
          message: "Translation unit must have an ID",
          path: `${unitPath}.id`,
        });
      } else if (unitIds.has(unit.id)) {
        errors.push({
          message: `Duplicate translation unit ID: ${unit.id}`,
          path: `${unitPath}.id`,
        });
      } else {
        unitIds.add(unit.id);
      }

      if (!unit.source || unit.source.trim() === "") {
        errors.push({
          message: `Translation unit '${unit.id}' must have source text`,
          path: `${unitPath}.source`,
        });
      }

      if (unit.target && !file.targetLanguage) {
        errors.push({
          message: `Translation unit '${unit.id}' has target text but file has no target language`,
          path: `${filePath}.targetLanguage`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

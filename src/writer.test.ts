import { describe, test, expect } from 'bun:test';
import { parse } from './parser.js';
import { write } from './writer.js';
import type { XliffDocument, WriterOptions } from './types.js';

describe('XLIFF Writer', () => {
  describe('XLIFF 1.2', () => {
    test('writes XLIFF 1.2 source-only document', () => {
      const doc: XliffDocument = {
        version: '1.2',
        files: [
          {
            id: 'test.xlf',
            sourceLanguage: 'en',
            datatype: 'plaintext',
            original: 'test.xlf',
            units: [
              {
                id: 'key1',
                source: 'Hello World',
              },
              {
                id: 'key2',
                source: 'Goodbye World',
              },
            ],
          },
        ],
      };

      const xml = write(doc);

      expect(xml).toContain('version="1.2"');
      expect(xml).toContain('source-language="en"');
      expect(xml).toContain('<trans-unit');
      expect(xml).toContain('Hello World');
      expect(xml).toContain('Goodbye World');

      const parsed = parse(xml);

      expect(parsed.files).toHaveLength(1);
      expect(parsed.files[0]?.units).toHaveLength(2);
    });

    test('writes XLIFF 1.2 with targets', () => {
      const doc: XliffDocument = {
        version: '1.2',
        files: [
          {
            id: 'test.xlf',
            sourceLanguage: 'en',
            targetLanguage: 'de',
            datatype: 'plaintext',
            original: 'test.xlf',
            units: [
              {
                id: 'key1',
                source: 'Hello World',
                target: 'Hallo Welt',
                state: 'final',
              },
            ],
          },
        ],
      };

      const xml = write(doc);

      expect(xml).toContain('target-language="de"');
      expect(xml).toContain('approved="yes"');
      expect(xml).toContain('<target>Hallo Welt</target>');

      const parsed = parse(xml);

      expect(parsed.files[0]?.targetLanguage).toBe('de');
      expect(parsed.files[0]?.units[0]?.target).toBe('Hallo Welt');
      expect(parsed.files[0]?.units[0]?.state).toBe('final');
    });
  });

  describe('XLIFF 2.0', () => {
    test('writes XLIFF 2.0 source-only document', () => {
      const doc: XliffDocument = {
        version: '2.0',
        files: [
          {
            id: 'f1',
            sourceLanguage: 'en',
            units: [
              {
                id: 'key1',
                source: 'Hello World',
              },
              {
                id: 'key2',
                source: 'Goodbye World',
              },
            ],
          },
        ],
      };

      const xml = write(doc);

      expect(xml).toContain('version="2.0"');
      expect(xml).toContain('srcLang="en"');
      expect(xml).toContain('<unit');
      expect(xml).toContain('<segment>');
      expect(xml).toContain('Hello World');
      expect(xml).toContain('Goodbye World');

      const parsed = parse(xml);

      expect(parsed.files).toHaveLength(1);
      expect(parsed.files[0]?.units).toHaveLength(2);
    });

    test('writes XLIFF 2.0 with targets', () => {
      const doc: XliffDocument = {
        version: '2.0',
        files: [
          {
            id: 'f1',
            sourceLanguage: 'en',
            targetLanguage: 'de',
            units: [
              {
                id: 'key1',
                source: 'Hello World',
                target: 'Hallo Welt',
                state: 'final',
              },
            ],
          },
        ],
      };

      const xml = write(doc);

      expect(xml).toContain('trgLang="de"');
      expect(xml).toContain('state="final"');
      expect(xml).toContain('<target>Hallo Welt</target>');

      const parsed = parse(xml);

      expect(parsed.files[0]?.targetLanguage).toBe('de');
      expect(parsed.files[0]?.units[0]?.target).toBe('Hallo Welt');
      expect(parsed.files[0]?.units[0]?.state).toBe('final');
    });
  });

  describe('Version conversion', () => {
    test('converts XLIFF 1.2 to 2.0', () => {
      const doc: XliffDocument = {
        version: '1.2',
        files: [
          {
            id: 'test.xlf',
            sourceLanguage: 'en',
            targetLanguage: 'de',
            units: [
              {
                id: 'key1',
                source: 'Hello',
                target: 'Hallo',
                state: 'final',
              },
            ],
          },
        ],
      };

      const xml = write(doc, '2.0');

      expect(xml).toContain('version="2.0"');
      expect(xml).toContain('srcLang="en"');
      expect(xml).toContain('<segment');

      const parsed = parse(xml);

      expect(parsed.version).toBe('2.0');
    });

    test('converts XLIFF 2.0 to 1.2', () => {
      const doc: XliffDocument = {
        version: '2.0',
        files: [
          {
            id: 'f1',
            sourceLanguage: 'en',
            targetLanguage: 'de',
            units: [
              {
                id: 'key1',
                source: 'Hello',
                target: 'Hallo',
                state: 'final',
              },
            ],
          },
        ],
      };

      const xml = write(doc, '1.2');

      expect(xml).toContain('version="1.2"');
      expect(xml).toContain('source-language="en"');
      expect(xml).toContain('<trans-unit');

      const parsed = parse(xml);

      expect(parsed.version).toBe('1.2');
    });
  });

  describe('Round-trip tests', () => {
    test('parse and write XLIFF 1.2 maintains data integrity', () => {
      const original = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
    <file source-language="en" target-language="de" datatype="plaintext" original="test.xlf">
        <header/>
        <body>
            <trans-unit id="key1" approved="yes">
                <source>Test</source>
                <target>Test DE</target>
            </trans-unit>
        </body>
    </file>
</xliff>`;

      const parsed = parse(original);
      const written = write(parsed);
      const reparsed = parse(written);

      expect(reparsed.files[0]?.sourceLanguage).toBe('en');
      expect(reparsed.files[0]?.targetLanguage).toBe('de');
      expect(reparsed.files[0]?.units[0]?.id).toBe('key1');
      expect(reparsed.files[0]?.units[0]?.source).toBe('Test');
      expect(reparsed.files[0]?.units[0]?.target).toBe('Test DE');
      expect(reparsed.files[0]?.units[0]?.state).toBe('final');
    });

    test('parse and write XLIFF 2.0 maintains data integrity', () => {
      const original = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="de">
    <file id="f1">
        <unit id="key1">
            <segment state="final">
                <source>Test</source>
                <target>Test DE</target>
            </segment>
        </unit>
    </file>
</xliff>`;

      const parsed = parse(original);
      const written = write(parsed);
      const reparsed = parse(written);

      expect(reparsed.files[0]?.sourceLanguage).toBe('en');
      expect(reparsed.files[0]?.targetLanguage).toBe('de');
      expect(reparsed.files[0]?.units[0]?.id).toBe('key1');
      expect(reparsed.files[0]?.units[0]?.source).toBe('Test');
      expect(reparsed.files[0]?.units[0]?.target).toBe('Test DE');
      expect(reparsed.files[0]?.units[0]?.state).toBe('final');
    });
  });

  describe('Writer Options', () => {
    const testDoc: XliffDocument = {
      version: '2.0',
      files: [
        {
          id: 'f1',
          sourceLanguage: 'en',
          units: [
            {
              id: 'test',
              source: 'Test',
            },
          ],
        },
      ],
    };

    test('uses default formatting', () => {
      const xml = write(testDoc);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('\n');
    });

    test('minifies output when format is false', () => {
      const options: WriterOptions = {
        format: false,
      };

      const xml = write(testDoc, undefined, options);

      expect(xml).not.toContain('\n    ');
    });

    test('uses custom indentation', () => {
      const options: WriterOptions = {
        indent: '  ',
      };

      const xml = write(testDoc, undefined, options);

      expect(xml).toContain('  <file');
    });

    test('suppresses XML declaration', () => {
      const options: WriterOptions = {
        suppressXmlDeclaration: true,
      };

      const xml = write(testDoc, undefined, options);

      expect(xml).not.toContain('<?xml');
      expect(xml).toContain('<xliff');

      const parsed = parse('<?xml version="1.0" encoding="UTF-8"?>\n' + xml);

      expect(parsed.files).toHaveLength(1);
    });

    test('uses tab indentation', () => {
      const options: WriterOptions = {
        indent: '\t',
      };

      const xml = write(testDoc, undefined, options);

      expect(xml).toContain('\t<file');
    });

    test('combines multiple options', () => {
      const options: WriterOptions = {
        indent: '  ',
        format: true,
      };

      const xml = write(testDoc, undefined, options);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('  <file');
      expect(xml).not.toContain('    <file');
    });

    test('works with version conversion and options', () => {
      const options: WriterOptions = {
        indent: '\t',
      };

      const xml = write(testDoc, '1.2', options);

      expect(xml).toContain('version="1.2"');
      expect(xml).toContain('\t<file');

      const parsed = parse(xml);

      expect(parsed.version).toBe('1.2');
      expect(parsed.files[0]?.units[0]?.source).toBe('Test');
    });
  });
});

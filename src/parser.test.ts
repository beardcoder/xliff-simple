import { describe, test, expect } from "bun:test";
import { parse } from "./parser.js";

const xliff12Source = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
    <file source-language="en" datatype="plaintext" original="test.xlf" date="2020-10-18T18:20:51Z" product-name="my_ext">
        <header/>
        <body>
            <trans-unit id="headerComment">
                <source>The default Header Comment.</source>
            </trans-unit>
            <trans-unit id="generator">
                <source>The "Generator" Meta Tag.</source>
            </trans-unit>
        </body>
    </file>
</xliff>`;

const xliff12Target = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
    <file source-language="en" target-language="de" datatype="plaintext" original="test.xlf" date="2020-10-18T18:20:51Z" product-name="my_ext">
        <header/>
        <body>
            <trans-unit id="headerComment" approved="yes">
                <source>The default Header Comment.</source>
                <target>Der Standard-Header-Kommentar.</target>
            </trans-unit>
            <trans-unit id="generator" approved="yes">
                <source>The "Generator" Meta Tag.</source>
                <target>Der "Generator"-Meta-Tag.</target>
            </trans-unit>
        </body>
    </file>
</xliff>`;

const xliff20Source = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
    <file id="f1">
        <unit id="headerComment">
            <segment>
                <source>The default Header Comment.</source>
            </segment>
        </unit>
        <unit id="generator">
            <segment>
                <source>The "Generator" Meta Tag.</source>
            </segment>
        </unit>
    </file>
</xliff>`;

const xliff20Target = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="de">
    <file id="f1">
        <unit id="headerComment">
            <segment state="final">
                <source>The default Header Comment.</source>
                <target>Der Standard-Header-Kommentar.</target>
            </segment>
        </unit>
        <unit id="generator">
            <segment state="final">
                <source>The "Generator" Meta Tag.</source>
                <target>Der "Generator"-Meta-Tag.</target>
            </segment>
        </unit>
    </file>
</xliff>`;

describe("XLIFF Parser", () => {
  describe("XLIFF 1.2", () => {
    test("parses source-only XLIFF 1.2", () => {
      const result = parse(xliff12Source);

      expect(result.version).toBe("1.2");
      expect(result.files).toHaveLength(1);

      const file = result.files[0];
      expect(file?.sourceLanguage).toBe("en");
      expect(file?.targetLanguage).toBeUndefined();
      expect(file?.datatype).toBe("plaintext");
      expect(file?.original).toBe("test.xlf");
      expect(file?.productName).toBe("my_ext");
      expect(file?.units).toHaveLength(2);

      const unit1 = file?.units[0];
      expect(unit1?.id).toBe("headerComment");
      expect(unit1?.source).toBe("The default Header Comment.");
      expect(unit1?.target).toBeUndefined();
      expect(unit1?.state).toBe("initial");

      const unit2 = file?.units[1];
      expect(unit2?.id).toBe("generator");
      expect(unit2?.source).toBe('The "Generator" Meta Tag.');
    });

    test("parses XLIFF 1.2 with targets", () => {
      const result = parse(xliff12Target);

      expect(result.version).toBe("1.2");
      expect(result.files).toHaveLength(1);

      const file = result.files[0];
      expect(file?.sourceLanguage).toBe("en");
      expect(file?.targetLanguage).toBe("de");
      expect(file?.units).toHaveLength(2);

      const unit1 = file?.units[0];
      expect(unit1?.id).toBe("headerComment");
      expect(unit1?.source).toBe("The default Header Comment.");
      expect(unit1?.target).toBe("Der Standard-Header-Kommentar.");
      expect(unit1?.state).toBe("final");

      const unit2 = file?.units[1];
      expect(unit2?.id).toBe("generator");
      expect(unit2?.target).toBe('Der "Generator"-Meta-Tag.');
      expect(unit2?.state).toBe("final");
    });
  });

  describe("XLIFF 2.0", () => {
    test("parses source-only XLIFF 2.0", () => {
      const result = parse(xliff20Source);

      expect(result.version).toBe("2.0");
      expect(result.files).toHaveLength(1);

      const file = result.files[0];
      expect(file?.id).toBe("f1");
      expect(file?.sourceLanguage).toBe("en");
      expect(file?.targetLanguage).toBeUndefined();
      expect(file?.units).toHaveLength(2);

      const unit1 = file?.units[0];
      expect(unit1?.id).toBe("headerComment");
      expect(unit1?.source).toBe("The default Header Comment.");
      expect(unit1?.target).toBeUndefined();

      const unit2 = file?.units[1];
      expect(unit2?.id).toBe("generator");
      expect(unit2?.source).toBe('The "Generator" Meta Tag.');
    });

    test("parses XLIFF 2.0 with targets", () => {
      const result = parse(xliff20Target);

      expect(result.version).toBe("2.0");
      expect(result.files).toHaveLength(1);

      const file = result.files[0];
      expect(file?.id).toBe("f1");
      expect(file?.sourceLanguage).toBe("en");
      expect(file?.targetLanguage).toBe("de");
      expect(file?.units).toHaveLength(2);

      const unit1 = file?.units[0];
      expect(unit1?.id).toBe("headerComment");
      expect(unit1?.source).toBe("The default Header Comment.");
      expect(unit1?.target).toBe("Der Standard-Header-Kommentar.");
      expect(unit1?.state).toBe("final");

      const unit2 = file?.units[1];
      expect(unit2?.id).toBe("generator");
      expect(unit2?.target).toBe('Der "Generator"-Meta-Tag.');
      expect(unit2?.state).toBe("final");
    });
  });

  describe("Error handling", () => {
    test("throws error for invalid XML", () => {
      expect(() => parse("not xml")).toThrow();
    });

    test("throws error for missing xliff root", () => {
      expect(() => parse('<?xml version="1.0"?><root></root>')).toThrow(
        "Invalid XLIFF"
      );
    });

    test("throws error for unsupported version", () => {
      const xml = '<?xml version="1.0"?><xliff version="3.0"></xliff>';
      expect(() => parse(xml)).toThrow("Unsupported XLIFF version");
    });
  });
});

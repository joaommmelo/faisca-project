import { describe, expect, it } from "vitest";
import { LocalesUtils } from "./utils.ts";

describe("LocalesUtils.detect", () => {
    it("speaks the country's language, even on a device set to another one", () => {
        expect(LocalesUtils.detect("Europe/Lisbon", ["en-US", "en"])).toBe("pt");
        expect(LocalesUtils.detect("Atlantic/Madeira", ["en-GB"])).toBe("pt");
        expect(LocalesUtils.detect("Europe/Paris", ["pt-PT"])).toBe("fr");
        expect(LocalesUtils.detect("Europe/Berlin", [])).toBe("de");
        expect(LocalesUtils.detect("Europe/Rome", [])).toBe("it");
        expect(LocalesUtils.detect("Europe/Madrid", [])).toBe("es");
        expect(LocalesUtils.detect("Europe/London", ["pt-PT"])).toBe("en");
    });

    it("covers every zone under a region that ends in a slash", () => {
        expect(LocalesUtils.detect("America/Argentina/Buenos_Aires", [])).toBe("es");
        expect(LocalesUtils.detect("Australia/Sydney", [])).toBe("en");
        expect(LocalesUtils.detect("America/Indiana/Indianapolis", [])).toBe("en");
    });

    it("leaves countries with several languages to the device", () => {
        expect(LocalesUtils.detect("Europe/Zurich", ["fr-CH", "de-CH"])).toBe("fr");
        expect(LocalesUtils.detect("Europe/Brussels", ["nl-BE", "fr-BE"])).toBe("fr");
        expect(LocalesUtils.detect("America/Toronto", ["fr-CA"])).toBe("fr");
    });

    it("takes the device's first language the app has, in the device's order", () => {
        expect(LocalesUtils.detect("Asia/Tokyo", ["ja-JP", "de-DE", "en-US"])).toBe("de");
        expect(LocalesUtils.detect("Asia/Tokyo", ["IT"])).toBe("it");
    });

    it("falls back to English when nothing matches", () => {
        expect(LocalesUtils.detect("Asia/Tokyo", ["ja-JP"])).toBe("en");
        expect(LocalesUtils.detect("UTC", [])).toBe("en");
    });
});

describe("LocalesUtils names", () => {
    it("names each language in its own words and tags Portuguese as European", () => {
        expect(LocalesUtils.getValidLocales().map((locale) => LocalesUtils.getLanguageName(locale))).toEqual([
            "Português",
            "English",
            "Español",
            "Français",
            "Deutsch",
            "Italiano"
        ]);
        expect(LocalesUtils.getLanguageTag("pt")).toBe("pt-PT");
        expect(LocalesUtils.getLanguageTag("de")).toBe("de");
    });
});

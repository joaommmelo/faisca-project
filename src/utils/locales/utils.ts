export type Locale = "pt" | "en" | "es" | "fr" | "de" | "it";

// The app's languages and which one a device starts in.
export class LocalesUtils {
    public static getValidLocales(): Locale[] {
        return ["pt", "en", "es", "fr", "de", "it"];
    }

    public static isValidLocale(value: string): value is Locale {
        return (this.getValidLocales() as string[]).includes(value);
    }

    // Where nothing else decides: the language most people can read.
    public static getFallbackLocale(): Locale {
        return "en";
    }

    // The country's language first, so a child in Portugal plays in Portuguese even on a tablet set to English. The
    // country comes from the time zone, which phones set from where they are: it never leaves the device, unlike an
    // IP lookup, and works offline. Countries with several languages, or none of ours, fall back to the device's
    // languages in its own order, and then to English.
    public static detect(timeZone: string, deviceLanguages: readonly string[]): Locale {
        const countryLocale: Locale | null = this.getCountryLocale(timeZone);
        if (countryLocale !== null) {
            return countryLocale;
        }
        const deviceLocale: Locale | undefined = deviceLanguages
            .map((language) => language.toLowerCase().split("-")[0])
            .find((language): language is Locale => this.isValidLocale(language));
        return deviceLocale ?? this.getFallbackLocale();
    }

    // For <html lang>: Portuguese is the European one.
    public static getLanguageTag(locale: Locale): string {
        return locale === "pt" ? "pt-PT" : locale;
    }

    // Each language in its own words, so anyone finds theirs whatever the app is showing.
    public static getLanguageName(locale: Locale): string {
        const names: Record<Locale, string> = {
            pt: "Português",
            en: "English",
            es: "Español",
            fr: "Français",
            de: "Deutsch",
            it: "Italiano"
        };
        return names[locale];
    }

    private static getCountryLocale(timeZone: string): Locale | null {
        const match = Object.entries(this.getCountryTimeZones()).find(([, timeZones]) =>
            timeZones.some((candidate) => (candidate.endsWith("/") ? timeZone.startsWith(candidate) : timeZone === candidate))
        );
        return match === undefined ? null : (match[0] as Locale);
    }

    // The time zones of countries with one main language among ours. A zone ending in "/" covers all zones under it.
    // Left out on purpose: Belgium, Luxembourg, Switzerland and Canada's Toronto zone (which covers Quebec).
    private static getCountryTimeZones(): Record<Locale, string[]> {
        return {
            pt: [
                "Europe/Lisbon",
                "Atlantic/Madeira",
                "Atlantic/Azores",
                "America/Sao_Paulo",
                "America/Fortaleza",
                "America/Recife",
                "America/Bahia",
                "America/Belem",
                "America/Maceio",
                "America/Araguaina",
                "America/Manaus",
                "America/Cuiaba",
                "America/Campo_Grande",
                "America/Porto_Velho",
                "America/Boa_Vista",
                "America/Rio_Branco",
                "America/Eirunepe",
                "America/Santarem",
                "America/Noronha",
                "Africa/Luanda",
                "Africa/Maputo",
                "Africa/Bissau",
                "Atlantic/Cape_Verde",
                "Africa/Sao_Tome"
            ],
            en: [
                "Europe/London",
                "Europe/Dublin",
                "Europe/Guernsey",
                "Europe/Jersey",
                "Europe/Isle_of_Man",
                "Europe/Gibraltar",
                "America/New_York",
                "America/Chicago",
                "America/Denver",
                "America/Los_Angeles",
                "America/Phoenix",
                "America/Anchorage",
                "America/Juneau",
                "America/Sitka",
                "America/Yakutat",
                "America/Nome",
                "America/Metlakatla",
                "America/Adak",
                "America/Boise",
                "America/Detroit",
                "America/Menominee",
                "America/Indiana/",
                "America/Kentucky/",
                "America/North_Dakota/",
                "Pacific/Honolulu",
                "America/Vancouver",
                "America/Edmonton",
                "America/Winnipeg",
                "America/Regina",
                "America/Halifax",
                "America/St_Johns",
                "America/Glace_Bay",
                "America/Goose_Bay",
                "America/Moncton",
                "America/Whitehorse",
                "America/Dawson",
                "Australia/",
                "Pacific/Auckland",
                "Pacific/Chatham"
            ],
            es: [
                "Europe/Madrid",
                "Atlantic/Canary",
                "Africa/Ceuta",
                "America/Mexico_City",
                "America/Cancun",
                "America/Merida",
                "America/Monterrey",
                "America/Matamoros",
                "America/Chihuahua",
                "America/Ciudad_Juarez",
                "America/Ojinaga",
                "America/Mazatlan",
                "America/Bahia_Banderas",
                "America/Hermosillo",
                "America/Tijuana",
                "America/Bogota",
                "America/Lima",
                "America/Santiago",
                "America/Punta_Arenas",
                "America/Caracas",
                "America/Guayaquil",
                "America/La_Paz",
                "America/Asuncion",
                "America/Montevideo",
                "America/Argentina/",
                "America/Buenos_Aires",
                "America/Havana",
                "America/Santo_Domingo",
                "America/Guatemala",
                "America/Tegucigalpa",
                "America/El_Salvador",
                "America/Managua",
                "America/Costa_Rica",
                "America/Panama",
                "Pacific/Galapagos",
                "Pacific/Easter",
                "Africa/Malabo"
            ],
            fr: [
                "Europe/Paris",
                "Europe/Monaco",
                "Indian/Reunion",
                "Indian/Mayotte",
                "America/Martinique",
                "America/Guadeloupe",
                "America/Cayenne",
                "America/Miquelon",
                "America/Port-au-Prince",
                "Pacific/Noumea",
                "Pacific/Tahiti",
                "Africa/Dakar",
                "Africa/Abidjan",
                "Africa/Kinshasa",
                "Africa/Lubumbashi",
                "Africa/Douala",
                "Africa/Libreville",
                "Africa/Brazzaville",
                "Africa/Bamako",
                "Africa/Ouagadougou",
                "Africa/Niamey",
                "Africa/Ndjamena",
                "Africa/Conakry",
                "Africa/Lome",
                "Africa/Porto-Novo",
                "Africa/Bangui"
            ],
            de: ["Europe/Berlin", "Europe/Busingen", "Europe/Vienna", "Europe/Vaduz"],
            it: ["Europe/Rome", "Europe/San_Marino", "Europe/Vatican"]
        };
    }
}

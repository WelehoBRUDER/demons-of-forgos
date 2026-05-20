"use strict";
class LanguageContext {
    language;
    languages = new Map();
    languageContent = {};
    constructor() {
        this.language = "en"; // Default language
        this.loadLanguages();
    }
    async loadLanguages() {
        try {
            const response = await fetch("resources/lang/manifest.json");
            const manifest = await response.json();
            for (const [code, name] of Object.entries(manifest)) {
                this.languages.set(code, name);
                this.loadLanguageContent(code).then((content) => {
                    this.languageContent = { ...this.languageContent, ...content }; // Merge the loaded content into the main language content object
                });
            }
        }
        catch (error) {
            console.error("Error loading language manifest:", error);
        }
    }
    setLanguage(lang) {
        if (this.languages.has(lang)) {
            this.language = lang;
        }
        else {
            console.warn(`Language ${lang} not found in manifest`);
        }
    }
    async loadLanguageContent(lang) {
        const content = {};
        const languageFiles = ["creatures", "ui"]; // List of language content files to load
        for (const file of languageFiles) {
            try {
                const response = await fetch(`resources/lang/${file}_${lang}.json`);
                const data = await response.json();
                Object.assign(content, data); // Merge content from each file into the main content object
            }
            catch (error) {
                console.error(`Error loading language file ${file}_${lang}.json:`, error);
            }
        }
        return content;
    }
}
const languageContext = new LanguageContext();
class Lang {
    static get(key) {
        // Implementation for fetching translated strings
        return languageContext.languageContent[key] || "";
    }
}
//# sourceMappingURL=lang.js.map
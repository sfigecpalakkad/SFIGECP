/**
 * SFI GECP - Global Configuration
 * Used to manage external data sources (Google Sheets)
 */

const CONFIG = {
    // Google Sheets Published CSV URLs
    // Instructions: File -> Share -> Publish to web -> Link -> CSV
    DATA_SOURCES: {
        KEAM_QUESTIONS: {
            sheetUrl: '', // To be filled by coordinator
            fallbackUrl: '../../assets/data/keam_questions.json'
        },
        SAHAYI_RESOURCES: {
            sheetUrl: '', // To be filled by coordinator
            fallbackUrl: '../assets/data/sahayi.json'
        },
        MEMBERS: {
            sheetUrl: '', // To be filled by coordinator
            fallbackUrl: 'assets/data/members.json'
        }
    },
    
    // Dependencies
    PAPA_PARSE_CDN: 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js'
};

// Export for module use or keep global for static script tags
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

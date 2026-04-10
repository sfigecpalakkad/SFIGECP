/**
 * SFI GECP - Data Controller
 * Handles fetching data from Google Sheets (CSV) with Local JSON fallback
 */

class DataController {
    constructor() {
        this.isPapaLoaded = false;
    }

    /**
     * Load PapaParse library dynamically if not present
     */
    async ensurePapaParse() {
        if (typeof Papa !== 'undefined') {
            this.isPapaLoaded = true;
            return true;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = CONFIG.PAPA_PARSE_CDN;
            script.onload = () => {
                this.isPapaLoaded = true;
                resolve(true);
            };
            script.onerror = () => reject(new Error('Failed to load PapaParse library'));
            document.head.appendChild(script);
        });
    }

    /**
     * Fetch and parse data from a source
     * @param {string} sourceKey - Key from CONFIG.DATA_SOURCES
     * @param {Function} transformer - Optional function to map CSV rows to JSON objects
     */
    async fetchData(sourceKey, transformer = null) {
        const source = CONFIG.DATA_SOURCES[sourceKey];
        if (!source) throw new Error(`Invalid source key: ${sourceKey}`);

        try {
            // 1. Try fetching from Google Sheets if URL is provided
            if (source.sheetUrl && navigator.onLine) {
                await this.ensurePapaParse();
                const data = await this.fetchFromSheets(source.sheetUrl, transformer);
                if (data) return data;
            }
        } catch (error) {
            console.warn(`[DataController] Sheets fetch failed for ${sourceKey}, falling back to JSON.`, error);
        }

        // 2. Fallback to Local JSON
        return this.fetchFromJSON(source.fallbackUrl);
    }

    /**
     * Fetch from Google Sheets CSV
     */
    async fetchFromSheets(url, transformer) {
        return new Promise((resolve, reject) => {
            Papa.parse(url, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.error('[DataController] PapaParse errors:', results.errors);
                    }
                    
                    let data = results.data;
                    if (transformer) {
                        data = transformer(data);
                    }
                    resolve(data);
                },
                error: (error) => reject(error)
            });
        });
    }

    /**
     * Fetch from local JSON file
     */
    async fetchFromJSON(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load JSON: ${url}`);
        return await response.json();
    }
}

// Global instance for simple access
window.dataController = new DataController();

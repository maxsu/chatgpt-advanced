// Data Objects

export class SearchRequest {
    /* The parameters of a search.
     * @property query - The search query.
     * @property backend - The backend to use for the search.
     * @property numResults - (Optional) The number of search results to retrieve.
     * @property region - (Optional) The region to use for the search.
     * @property timerange - (Optional) The time range to use for the search.  */
    query: string;
    backend?: string;
    numResults?: number;
    region?: string;
    timerange?: string;
}

export class SearchPage {
    /* A response from an external search page.
     * @property status - The HTTP status code of the response.
     * @property html - The HTML content of the fetched page.
     * @property url - The URL of the fetched page.  */
    status: number;
    html: string;
    url: string;
}

export class SearchResult {
    /* A single search result.
    * @property title - The title of the search result.
    * @property body - The body or summary of the search result.
    * @property url - The URL of the search result.  */
    title: string;
    body: string;
    url: string;
}

export class SearchResults extends Array<SearchResult> {
    /* A printable collection of search results.
     * @property toString - Returns a string representation of the SearchResults.
     * @property error - (Optional) An error object if there was an error during the search process.
    */
    error?: Error;
    toString(): string {
        if (this.error) {
            return `Error: ${this.error.message}`;
        }
        return this
            .map((result, index) => `${index + 1}. ${result.title}\n${result.body}\n${result.url}`)
            .join("\n\n");
    }
}

// Interfaces

export interface ISearchEngine {
    /* A search engine backend.
     * @method search - Performs a search with the provided SearchRequest and returns a Promise with SearchResults.
     * @method fetch - Fetches a SearchPage using the provided SearchRequest.
     * @method extract - Extracts SearchResults from the provided SearchPage. */
    search(searchRequest: SearchRequest): Promise<SearchResults>;
    fetch(searchRequest: SearchRequest): Promise<SearchPage>;
    extract(searchResponse: SearchPage): SearchResults;
}

export interface ISearchFrontend {
    /* A search frontend.
     * @property backend_key - A key for calling a searchengine  backend 
     * @method search - Performs a search with the provided SearchRequest and returns a Promise with SearchResults.  */
    backend_key: string;
    search(searchRequest: SearchRequest): Promise<SearchResults>;
}

export interface ISearchListener {
    /* A backend search listener responsible for managing search engines and dispatching search requests.
     * @property engines - A map of registered search engines.
     * @method registerSearchEngine - Registers a search engine with the provided backend key.
     * @method dispatchMessageEvent - Dispatches a search request message and returns a Promise with SearchResults.  */
    engines: Map<string, ISearchEngine>;
    register(backendKey: string, searchEngine: ISearchEngine): void;
    listener(message: SearchRequest): Promise<SearchResults>;
}

// Search Engine Backend Keys
export const SEARCH_BACKENDS = {
    DdgSearch: { key: "DdgSearch" },
    PageText: { key: "PageText" }
}

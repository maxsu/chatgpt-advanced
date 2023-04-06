import Browser from "webextension-polyfill";

import {
    SearchRequest,
    SearchResults,
    ISearchFrontend,
    SEARCH_BACKENDS
} from ".";

class SearchFrontend implements ISearchFrontend {
    /* A search frontend.
     * @property backend_key - Used to send messages to the backend
     * @method search - Performs a search with the provided SearchRequest and returns a Promise with SearchResults.  */
    backend_key: string;

    search(searchRequest: SearchRequest): Promise<SearchResults> {
        searchRequest.backend = this.backend_key;
        const results = Browser.runtime.sendMessage(searchRequest)
        return results
    }
}


export class DdgSearchFrontend extends SearchFrontend {
    backend_key = SEARCH_BACKENDS.DdgSearch.key
}

export class PageTextFrontend extends SearchFrontend {
    backend_key = SEARCH_BACKENDS.PageText.key
}
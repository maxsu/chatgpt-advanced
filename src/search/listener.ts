import Browser from 'webextension-polyfill';

import { ISearchEngine, ISearchListener, SearchRequest, SearchResults } from '.'


export class SearchListener implements ISearchListener {
    /* A backend search listener responsible for managing search engines and dispatching search requests.
     * @property engines - A map of registered search engines.
     * @method registerSearchEngine - Registers a search engine with the provided backend key.
     * @method dispatchMessageEvent - Dispatches a search request message and returns a Promise with SearchResults.  */
    constructor() {
        Browser.runtime.onMessage.addListener(this.listener.bind(this))
    }

    engines: Map<string, ISearchEngine>;
    register(backendKey: string, searchEngine: ISearchEngine): void {
        this.engines[backendKey] = searchEngine;
    }

    listener(searchRequest: SearchRequest): Promise<SearchResults> {
        const engine_key = searchRequest.backend ?? undefined;
        if (!engine_key) {
            return
        }
        const dispatched_engine: ISearchEngine = this.engines[engine_key];
        const results: Promise<SearchResults> = dispatched_engine.search(searchRequest);
        return results
    }
}


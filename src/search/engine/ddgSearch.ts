import cheerio from 'cheerio'

import { ISearchEngine, SearchRequest, SearchPage, SearchResults } from '..';
import { PageText } from './pageText';


const DDG_URL = 'https://lite.duckduckgo.com/lite/'
const DDG_HEADER = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'text/html,application/xhtml+xml,application/xmlq=0.9,image/avif,image/webp,image/apng,*/*q=0.8,application/signed-exchangev=b3q=0.7',
    AcceptEncoding: 'gzip, deflate, br',
}

export class DdgSearch implements ISearchEngine {
    async search(searchRequest: SearchRequest): Promise<SearchResults> {

        const searchPage: SearchPage = await this.fetch(searchRequest);
        const isBangSearch = searchPage.url === DDG_URL;

        // Handle standard search results
        if (!isBangSearch) {
            const results: SearchResults = this.extract(searchPage)
            return results.slice(0, searchRequest.numResults)
        }

        // Handle bang searches
        const pageTextEngine: ISearchEngine = new PageText();
        const results: SearchResults = pageTextEngine.extract(searchPage)
        return results;
    }

    async fetch(searchRequest: SearchRequest): Promise<SearchPage> {
        const queryString: string = new URLSearchParams({
            q: searchRequest.query.slice(0, 495), // DDG limit
            df: searchRequest.timerange,
            kl: searchRequest.region,
        }).toString()

        const response: Response = await fetch(DDG_URL, {
            method: 'POST',
            headers: DDG_HEADER,
            body: queryString,
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
        }

        return { status: response.status, html: await response.text(), url: response.url }
    }

    extract(searchPage: SearchPage): SearchResults {

        const results: SearchResults = [];
        const $ = cheerio.load(searchPage.html);

        // Select information
        const zeroClickLink = $('table:nth-of-type(2) tr td a[rel="nofollow"]').first();
        const zeroClickContents = $('table:nth-of-type(2) tr:nth-of-type(2)').text().trim()
        const webLinks = $('table:nth-of-type(3) .result-link');
        const webSnippets = $('table:nth-of-type(3) .result-snippet');

        // Extract Zero-Click results
        if (zeroClickLink) {
            results.push({
                title: zeroClickLink.text(),
                body: zeroClickContents,
                url: zeroClickLink.attr('href') ?? '',
            });
        }

        // Extract web search results
        webLinks.each((i, link) => {
            results.push({
                title: $(link).text(),
                body: $(webSnippets[i]).text().trim(),
                url: $(link).attr('href') ?? '',
            });
        });

        return results;
    }
}
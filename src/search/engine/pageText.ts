import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';

import { ISearchEngine, SearchRequest, SearchPage, SearchResults, SearchResult } from '..';

const cleanText = (text: string) =>
    text.trim()
        .replace(/(\n){4,}/g, "\n\n\n")
        .replace(/ {3,}/g, "  ")
        .replace(/\t/g, "")
        .replace(/\n+(\s*\n)*/g, "\n")

export class PageText implements ISearchEngine {
    async search(searchRequest: SearchRequest): Promise<SearchResults> {
        const searchPage = await this.fetch(searchRequest);
        const results = this.extract(searchPage);
        return results;
    }

    async fetch(searchRequest: SearchRequest): Promise<SearchPage> {

        let url: string;

        if (searchRequest.query.startsWith('http')) {
            url = searchRequest.query;
        } else {
            url = `https://${searchRequest.query}`;
        }

        let response: Response

        try {
            response = await fetch(url)
        } catch (e) {
            return {
                status: 666,
                html: `Could not fetch the page: ${e}.\nMake sure the URL is correct.`,
                url
            }
        }
        if (!response.ok) {
            return {
                status: 666,
                html: `Could not fetch the page: ${response.status} ${response.statusText}`,
                url
            }
        }
        return { status: response.status, html: await response.text(), url: response.url }

    }

    extract(searchPage: SearchPage): SearchResults {

        const doc = parseHTML(searchPage.html).document;
        const parsed = new Readability(doc).parse();

        if (!parsed) {
            const result: SearchResult = { title: "Could not parse the page.", body: "", url: searchPage.url };
            return [result]
        }

        const text = cleanText(parsed.textContent);
        const result: SearchResult = { title: parsed.title, body: text, url: searchPage.url };
        return [result];
    }
}
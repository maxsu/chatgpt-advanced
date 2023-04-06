import { DdgSearch, PageText , ISearchEngine, SEARCH_BACKENDS} from 'src/search/engine'
import { SearchListener } from 'src/search/listener'

const listener = new SearchListener();

const ddgSearch: ISearchEngine = new DdgSearch();
const pageText: ISearchEngine = new PageText();

listener.register(SEARCH_BACKENDS.DdgSearch.key, ddgSearch);
listener.register(SEARCH_BACKENDS.PageText.key, pageText);
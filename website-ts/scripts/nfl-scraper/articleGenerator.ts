// NFL News Scraper - Article Generator Utilities
// Only contains utility functions used by runAll.ts

import { ProcessedArticle } from './types'

// Generate filename for article
export function generateFilename(article: ProcessedArticle): string {
    return `${article.date}-${article.slug}.md`
}

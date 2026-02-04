// NFL News Scraper - ChatGPT OAuth (Codex backend) Integration

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OPENAI_REFRESH_TOKEN = process.env.OPENAI_REFRESH_TOKEN
const TOKEN_FILE = path.join(__dirname, '.chatgpt-token.json')

const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann'
const TOKEN_URL = 'https://auth.openai.com/oauth/token'
const CODEX_BASE_URL = 'https://chatgpt.com/backend-api'
const CODEX_RESPONSES_URL = `${CODEX_BASE_URL}/codex/responses`
const MODEL_NAME = 'gpt-5.2'

interface TokenResponse {
    access_token?: string
    refresh_token?: string
    expires_in?: number
}

interface TokenCache {
    accessToken: string
    refreshToken: string
    expiresAt: number
}

interface CodexResponse {
    output?: Array<{
        type?: string
        content?: Array<{
            type?: string
            text?: string
        }>
    }>
    error?: {
        message?: string
    }
}

let cachedToken: TokenCache | null = null

// Load refresh token from file or environment variable
function loadRefreshToken(): string | null {
    // Try to load from file first (persisted token)
    if (fs.existsSync(TOKEN_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'))
            if (data.refreshToken && typeof data.refreshToken === 'string') {
                return data.refreshToken
            }
        } catch (error) {
            console.warn('  ⚠️ Failed to read token file, using environment variable')
        }
    }
    // Fall back to environment variable
    return OPENAI_REFRESH_TOKEN || null
}

// Save refresh token to file for reuse
function saveRefreshToken(refreshToken: string): void {
    try {
        fs.writeFileSync(TOKEN_FILE, JSON.stringify({ refreshToken }, null, 2))
    } catch (error) {
        console.warn('  ⚠️ Failed to save refresh token to file:', error)
    }
}

export function isChatGPTAvailable(): boolean {
    return !!loadRefreshToken()
}

function base64UrlDecode(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=')
    return Buffer.from(padded, 'base64').toString('utf-8')
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) {
            return null
        }
        return JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>
    } catch {
        return null
    }
}

function getChatGptAccountId(accessToken: string): string | null {
    const payload = decodeJwtPayload(accessToken)
    if (!payload) {
        return null
    }

    const claim = payload['https://api.openai.com/auth'] as Record<string, unknown> | undefined
    const accountId = claim?.chatgpt_account_id
    return typeof accountId === 'string' ? accountId : null
}

async function refreshAccessToken(refreshToken: string): Promise<TokenCache | null> {
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: CLIENT_ID,
        }),
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.warn(`  ⚠️ ChatGPT token refresh failed: ${response.status}`, errorText.substring(0, 120))
        return null
    }

    const data = await response.json() as TokenResponse
    if (!data.access_token || !data.refresh_token || typeof data.expires_in !== 'number') {
        console.warn('  ⚠️ ChatGPT token response missing fields')
        return null
    }

    // CRITICAL: Save the new refresh token immediately
    // OpenAI invalidates the old refresh token when issuing a new one
    saveRefreshToken(data.refresh_token)

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
    }
}

async function getAccessToken(): Promise<{ token: string; accountId: string } | null> {
    const refreshToken = cachedToken?.refreshToken || loadRefreshToken()
    if (!refreshToken) {
        return null
    }

    if (cachedToken && cachedToken.expiresAt > Date.now() + 60 * 1000) {
        const accountId = getChatGptAccountId(cachedToken.accessToken)
        if (accountId) {
            return { token: cachedToken.accessToken, accountId }
        }
    }

    const updated = await refreshAccessToken(refreshToken)
    if (!updated) {
        return null
    }

    cachedToken = updated
    const accountId = getChatGptAccountId(updated.accessToken)
    if (!accountId) {
        console.warn('  ⚠️ ChatGPT access token missing account id')
        return null
    }

    return { token: updated.accessToken, accountId }
}

function extractResponseText(response: CodexResponse): string | null {
    const output = response.output
    if (!output || output.length === 0) {
        return null
    }

    for (const item of output) {
        if (!item.content) {
            continue
        }
        for (const content of item.content) {
            if (content?.text) {
                return content.text
            }
        }
    }

    return null
}

function extractTextFromEvent(event: Record<string, unknown>): string | null {
    const eventType = event.type
    if (eventType === 'response.output_text.delta' && typeof event.delta === 'string') {
        return event.delta
    }
    if (eventType === 'response.output_text.done' && typeof event.text === 'string') {
        return event.text
    }
    if (eventType === 'response.completed' && typeof event.response === 'object' && event.response) {
        return extractResponseText(event.response as CodexResponse)
    }
    return null
}

function extractTextFromSse(body: string): string | null {
    const lines = body.split('\n')
    let output = ''

    for (const line of lines) {
        if (!line.startsWith('data:')) {
            continue
        }
        const data = line.slice(5).trim()
        if (!data || data === '[DONE]') {
            continue
        }
        try {
            const payload = JSON.parse(data) as Record<string, unknown>
            const chunk = extractTextFromEvent(payload)
            if (chunk) {
                output += chunk
            }
        } catch {
            continue
        }
    }

    return output.trim() ? output : null
}

export async function generateWithChatGPT(
    title: string,
    sources: Array<{ name: string; title: string; description: string; url: string }>,
    category: string
): Promise<string | null> {
    if (!isChatGPTAvailable()) {
        console.log('  ℹ️ ChatGPT token not available (check .chatgpt-token.json or OPENAI_REFRESH_TOKEN)')
        return null
    }

    const sourceInfo = sources
        .map(s => `Source: ${s.name}\nHeadline: ${s.title}\nContent: ${s.description}`)
        .join('\n\n---\n\n')

    const prompt = `You are a senior NFL beat reporter writing for a professional sports news website. Your articles are known for their depth, accuracy, and engaging narrative style.

Based on the following source material from multiple news outlets, write a comprehensive news article.

CATEGORY: ${category}

SOURCE MATERIAL:
${sourceInfo}

ARTICLE REQUIREMENTS:
1. **Length**: Write 300-450 words minimum. This should feel like a full news article, not a brief.
2. **Structure**: 
   - Opening paragraph: Hook the reader with the key news and its significance
   - Body paragraphs: Expand on details, context, and implications
   - Include relevant background information for readers unfamiliar with the story
   - Closing paragraph: Future outlook, what to watch for, or broader implications
3. **Journalism Standards**:
   - Write in third-person, professional AP style
   - Include specific facts, figures, and details from the sources
   - If quotes are available in the sources, incorporate them naturally
   - Provide context (e.g., team records, player history, salary cap implications)
   - Explain WHY this news matters to NFL fans
4. **Tone**: Authoritative but accessible. Write for passionate NFL fans who want depth.
5. **Do NOT**:
   - Include a title or headline (that's handled separately)
   - Make up facts, quotes, or statistics not in the sources
   - Use first-person or editorial opinions
   - Use bullet points or lists - write in flowing paragraphs

Write the full article now:`

    const tokenInfo = await getAccessToken()
    if (!tokenInfo) {
        console.warn('  ⚠️ ChatGPT OAuth token unavailable')
        return null
    }

    const response = await fetch(CODEX_RESPONSES_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${tokenInfo.token}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'responses=experimental',
            originator: 'codex_cli_rs',
            'chatgpt-account-id': tokenInfo.accountId,
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            stream: true,
            store: false,
            include: ['reasoning.encrypted_content'],
            instructions: 'You are a senior NFL beat reporter writing for a professional sports news website. Write in third-person AP style, using only the provided sources.',
            input: [
                {
                    type: 'message',
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: prompt,
                        },
                    ],
                },
            ],
        }),
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        if (response.status === 429) {
            console.log('  ⏳ ChatGPT rate limited, will queue for manual generation')
            return null
        }
        console.warn(`  ⚠️ ChatGPT API error: ${response.status}`, errorText.substring(0, 120))
        return null
    }

    const responseBody = await response.text()
    const generatedText = extractTextFromSse(responseBody)
    if (!generatedText) {
        console.warn('  ⚠️ ChatGPT response missing text')
        return null
    }

    console.log(`  ✨ AI generated using ${MODEL_NAME} (ChatGPT OAuth)`)
    return generatedText.trim()
}

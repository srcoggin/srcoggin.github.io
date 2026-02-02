// NFL News Scraper - GitHub Copilot AI Integration
// Uses GitHub Copilot Chat endpoint with GitHub App auth

import { createSign } from 'crypto'

const APP_ID = process.env.APP_ID
const APP_PRIVATE_KEY = process.env.APP_PRIVATE_KEY
const APP_INSTALLATION_ID = process.env.APP_INSTALLATION_ID
const PAT_TOKEN = process.env.PAT_TOKEN

const COPILOT_API_URL = 'https://api.githubcopilot.com/chat/completions'
const GITHUB_API_URL = 'https://api.github.com'
const COPILOT_MODEL = process.env.COPILOT_MODEL || 'gpt-4o'

interface CopilotResponse {
    choices?: Array<{
        message?: {
            content?: string
        }
    }>
    error?: {
        message?: string
    }
}

interface TokenCache {
    token: string
    expiresAt: number
}

let cachedInstallationToken: TokenCache | null = null
let cachedUserCopilotToken: TokenCache | null = null

// Check if Copilot is available (App-only by design)
export function isCopilotAvailable(): boolean {
    return !!(APP_ID && APP_PRIVATE_KEY && APP_INSTALLATION_ID)
}

function normalizePrivateKey(value: string): string {
    return value.includes('\n') ? value.replace(/\\n/g, '\n') : value
}

function base64UrlEncode(value: Buffer | string): string {
    const buffer = typeof value === 'string' ? Buffer.from(value) : value
    return buffer
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
}

function createAppJwt(appId: string, privateKey: string): string {
    const now = Math.floor(Date.now() / 1000)
    const header = { alg: 'RS256', typ: 'JWT' }
    const payload = {
        iat: now - 60,
        exp: now + 540,
        iss: appId,
    }

    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(JSON.stringify(payload))
    const signingInput = `${encodedHeader}.${encodedPayload}`

    const signer = createSign('RSA-SHA256')
    signer.update(signingInput)
    signer.end()

    const signature = signer.sign(privateKey)
    const encodedSignature = base64UrlEncode(signature)

    return `${signingInput}.${encodedSignature}`
}

function parseExpiresAt(expiresAt: string | undefined): number {
    if (!expiresAt) {
        return Date.now() + 50 * 60 * 1000
    }
    const parsed = Date.parse(expiresAt)
    return Number.isNaN(parsed) ? Date.now() + 50 * 60 * 1000 : parsed
}

async function fetchInstallationToken(): Promise<TokenCache | null> {
    if (!APP_ID || !APP_PRIVATE_KEY || !APP_INSTALLATION_ID) {
        return null
    }

    const privateKey = normalizePrivateKey(APP_PRIVATE_KEY)
    const jwt = createAppJwt(APP_ID, privateKey)
    const url = `${GITHUB_API_URL}/app/installations/${APP_INSTALLATION_ID}/access_tokens`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${jwt}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'nfl-scraper',
        },
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.warn(`  ⚠️ GitHub App token request failed: ${response.status}`, errorText.substring(0, 120))
        return null
    }

    const data = await response.json() as { token?: string; expires_at?: string }
    if (!data.token) {
        console.warn('  ⚠️ GitHub App token response missing token')
        return null
    }

    return {
        token: data.token,
        expiresAt: parseExpiresAt(data.expires_at),
    }
}

async function getInstallationToken(): Promise<string | null> {
    if (cachedInstallationToken && cachedInstallationToken.expiresAt > Date.now() + 60 * 1000) {
        return cachedInstallationToken.token
    }

    const token = await fetchInstallationToken()
    if (!token) {
        return null
    }

    cachedInstallationToken = token
    return token.token
}

async function fetchCopilotUserToken(): Promise<TokenCache | null> {
    if (!PAT_TOKEN) {
        return null
    }

    const response = await fetch(`${GITHUB_API_URL}/copilot_internal/v2/token`, {
        method: 'GET',
        headers: {
            Authorization: `token ${PAT_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'nfl-scraper',
        },
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.warn(`  ⚠️ Copilot user token request failed: ${response.status}`, errorText.substring(0, 120))
        return null
    }

    const data = await response.json() as { token?: string; expires_at?: string }
    if (!data.token) {
        console.warn('  ⚠️ Copilot user token response missing token')
        return null
    }

    return {
        token: data.token,
        expiresAt: parseExpiresAt(data.expires_at),
    }
}

async function getCopilotUserToken(): Promise<string | null> {
    if (cachedUserCopilotToken && cachedUserCopilotToken.expiresAt > Date.now() + 60 * 1000) {
        return cachedUserCopilotToken.token
    }

    const token = await fetchCopilotUserToken()
    if (!token) {
        return null
    }

    cachedUserCopilotToken = token
    return token.token
}

async function sendCopilotRequest(prompt: string, token: string): Promise<{ ok: boolean; status: number; text?: string }> {
    const response = await fetch(COPILOT_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'nfl-scraper',
        },
        body: JSON.stringify({
            model: COPILOT_MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 2048,
            stream: false,
        }),
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        return { ok: false, status: response.status, text: errorText }
    }

    const data: CopilotResponse = await response.json()
    const generatedText = data.choices?.[0]?.message?.content
    if (generatedText) {
        return { ok: true, status: response.status, text: generatedText }
    }

    return { ok: false, status: response.status, text: data.error?.message }
}

// Generate an enhanced article using Copilot
export async function generateWithCopilot(
    title: string,
    sources: Array<{ name: string; title: string; description: string; url: string }>,
    category: string
): Promise<string | null> {
    if (!isCopilotAvailable()) {
        console.log('  ℹ️ Copilot App credentials not set')
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

    const installationToken = await getInstallationToken()
    if (!installationToken) {
        console.log('  ⚠️ Unable to obtain GitHub App token for Copilot')
        return null
    }

    const primaryResult = await sendCopilotRequest(prompt, installationToken)
    if (primaryResult.ok && primaryResult.text) {
        console.log(`  ✨ AI generated using Copilot (${COPILOT_MODEL})`)
        return primaryResult.text.trim()
    }

    if (primaryResult.status !== 401 && primaryResult.status !== 403) {
        if (primaryResult.status === 429) {
            console.log('  ⏳ Copilot rate limited, will queue for manual generation')
        } else {
            console.warn(`  ⚠️ Copilot API error: ${primaryResult.status}`, (primaryResult.text || '').substring(0, 120))
        }
        return null
    }

    if (!PAT_TOKEN) {
        console.warn('  🔑 Copilot App token rejected and PAT_TOKEN not set')
        return null
    }

    console.warn('  🔑 Copilot App token rejected, attempting PAT fallback...')
    const userToken = await getCopilotUserToken()
    if (!userToken) {
        console.warn('  ❌ Copilot PAT fallback failed to obtain token')
        return null
    }

    const fallbackResult = await sendCopilotRequest(prompt, userToken)
    if (fallbackResult.ok && fallbackResult.text) {
        console.log(`  ✨ AI generated using Copilot (${COPILOT_MODEL}) via PAT fallback`)
        return fallbackResult.text.trim()
    }

    if (fallbackResult.status === 429) {
        console.log('  ⏳ Copilot rate limited, will queue for manual generation')
        return null
    }

    console.warn(`  ⚠️ Copilot PAT fallback error: ${fallbackResult.status}`, (fallbackResult.text || '').substring(0, 120))
    return null
}

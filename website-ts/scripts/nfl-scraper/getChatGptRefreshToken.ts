// One-time ChatGPT OAuth flow to get a refresh token

import { createHash, randomBytes } from 'crypto'
import http from 'http'
import { spawn } from 'child_process'
import readline from 'readline'

const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann'
const AUTHORIZE_URL = 'https://auth.openai.com/oauth/authorize'
const TOKEN_URL = 'https://auth.openai.com/oauth/token'
const REDIRECT_URI = 'http://localhost:1455/auth/callback'
const SCOPE = 'openid profile email offline_access'

function base64UrlEncode(buffer: Buffer): string {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '')
}

function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    const bytes = randomBytes(length)
    return Array.from(bytes)
        .map(byte => chars[byte % chars.length])
        .join('')
}

function createPkcePair(): { verifier: string; challenge: string } {
    const verifier = generateRandomString(43)
    const challenge = base64UrlEncode(createHash('sha256').update(verifier).digest())
    return { verifier, challenge }
}

function createState(): string {
    return base64UrlEncode(randomBytes(32))
}

function buildAuthorizeUrl(state: string, challenge: string): string {
    const url = new URL(AUTHORIZE_URL)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', CLIENT_ID)
    url.searchParams.set('redirect_uri', REDIRECT_URI)
    url.searchParams.set('scope', SCOPE)
    url.searchParams.set('code_challenge', challenge)
    url.searchParams.set('code_challenge_method', 'S256')
    url.searchParams.set('state', state)
    url.searchParams.set('id_token_add_organizations', 'true')
    url.searchParams.set('codex_cli_simplified_flow', 'true')
    url.searchParams.set('originator', 'opencode')
    return url.toString()
}

function openBrowser(url: string): void {
    const platform = process.platform
    if (platform === 'win32') {
        const child = spawn('cmd', ['/c', 'start', '', `"${url}"`], {
            stdio: 'ignore',
        })
        child.on('error', () => {})
        return
    }

    const opener = platform === 'darwin' ? 'open' : 'xdg-open'
    const child = spawn(opener, [url], {
        stdio: 'ignore',
    })
    child.on('error', () => {})
}

function startOAuthServer(state: string): Promise<{ code: string } | null> {
    return new Promise(resolve => {
        const server = http.createServer((req, res) => {
            try {
                const url = new URL(req.url || '', 'http://localhost')
                if (url.pathname !== '/auth/callback') {
                    res.statusCode = 404
                    res.end('Not found')
                    return
                }
                if (url.searchParams.get('state') !== state) {
                    res.statusCode = 400
                    res.end('State mismatch')
                    return
                }
                const code = url.searchParams.get('code')
                if (!code) {
                    res.statusCode = 400
                    res.end('Missing authorization code')
                    return
                }
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/html; charset=utf-8')
                res.end('<h2>Success</h2><p>You can close this tab.</p>')
                server.close()
                resolve({ code })
            } catch {
                res.statusCode = 500
                res.end('Internal error')
            }
        })

        server.listen(1455, '127.0.0.1', () => {})
        server.on('error', () => {
            resolve(null)
        })

        setTimeout(() => {
            server.close()
            resolve(null)
        }, 5 * 60 * 1000)
    })
}

async function promptForRedirectUrl(): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const answer = await new Promise<string>(resolve => {
        rl.question('Paste the full redirect URL here: ', input => resolve(input))
    })
    rl.close()
    return answer.trim()
}

function parseAuthorizationCode(input: string): string | null {
    try {
        const url = new URL(input)
        return url.searchParams.get('code')
    } catch {
        return null
    }
}

async function exchangeCodeForToken(code: string, verifier: string): Promise<{ refreshToken: string } | null> {
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code,
            code_verifier: verifier,
            redirect_uri: REDIRECT_URI,
        }),
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.error(`Token exchange failed: ${response.status}`, errorText.substring(0, 120))
        return null
    }

    const data = await response.json() as { refresh_token?: string }
    if (!data.refresh_token) {
        console.error('Token response missing refresh_token')
        return null
    }

    return { refreshToken: data.refresh_token }
}

async function main(): Promise<void> {
    const { verifier, challenge } = createPkcePair()
    const state = createState()
    const url = buildAuthorizeUrl(state, challenge)

    console.log('Open this URL in your browser to authorize:')
    console.log(url)
    openBrowser(url)

    const serverResult = await startOAuthServer(state)
    let code = serverResult?.code

    if (!code) {
        const redirectUrl = await promptForRedirectUrl()
        code = parseAuthorizationCode(redirectUrl) || undefined
    }

    if (!code) {
        console.error('Authorization code not found. Aborting.')
        process.exit(1)
    }

    const tokenResult = await exchangeCodeForToken(code, verifier)
    if (!tokenResult) {
        process.exit(1)
    }

    console.log('\nRefresh token acquired. Set this as OPENAI_REFRESH_TOKEN in GitHub Actions:')
    console.log(tokenResult.refreshToken)
}

main().catch(error => {
    console.error('Unexpected error:', error)
    process.exit(1)
})

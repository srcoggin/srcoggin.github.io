// NFL News Scraper - Gemini AI Integration
// Uses Google's Gemini API for enhanced article generation

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

interface GeminiResponse {
    candidates?: Array<{
        content: {
            parts: Array<{ text: string }>
        }
    }>
    error?: {
        message: string
    }
}

// Check if Gemini is available
export function isGeminiAvailable(): boolean {
    return !!GEMINI_API_KEY
}

// List of models to try in order
const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001'
]

// Generate an enhanced article using Gemini
export async function generateWithGemini(
    title: string,
    sources: Array<{ name: string; title: string; description: string; url: string }>,
    category: string
): Promise<string | null> {
    if (!GEMINI_API_KEY) {
        console.log('  ℹ️ Gemini API key not set, using template-based generation')
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

    // Try each model until one works
    for (const model of GEMINI_MODELS) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: prompt }],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 2048,
                        },
                        safetySettings: [
                            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                        ],
                    }),
                }
            )

            if (!response.ok) {
                // If 404, it means model not found/available, try next one
                if (response.status === 404) {
                    continue
                }
                const errorText = await response.text()
                console.warn(`  ⚠️ Gemini API error (${model}): ${response.status}`, errorText.substring(0, 100))
                continue
            }

            const data: GeminiResponse = await response.json()

            if (data.error) {
                console.warn(`  ⚠️ Gemini error (${model}): ${data.error.message}`)
                continue
            }

            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (generatedText) {
                console.log(`  ✨ AI generated using ${model}`)
                return generatedText.trim()
            }

        } catch (error) {
            console.warn(`  ⚠️ Gemini connection failed (${model}):`, error instanceof Error ? error.message : String(error))
        }
    }

    // If we get here, all models failed
    console.warn('  ⚠️ All Gemini models failed, falling back to template')
    return null
}

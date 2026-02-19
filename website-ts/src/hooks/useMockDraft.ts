import { useState, useEffect } from 'react'
import { MockDraftData } from '@/types'

let cachedDraft: MockDraftData | null = null
let fetchPromise: Promise<MockDraftData | null> | null = null

async function fetchMockDraft(): Promise<MockDraftData | null> {
    if (cachedDraft) return cachedDraft
    if (fetchPromise) return fetchPromise

    fetchPromise = (async () => {
        try {
            const response = await fetch('/json_data/mock_draft.json')
            if (response.ok) {
                cachedDraft = await response.json()
                return cachedDraft
            }
        } catch (error) {
            console.error('Error loading mock draft:', error)
        } finally {
            fetchPromise = null
        }
        return null
    })()

    return fetchPromise
}

export function useMockDraft() {
    const [mockDraft, setMockDraft] = useState<MockDraftData | null>(cachedDraft)

    useEffect(() => {
        if (!cachedDraft) {
            fetchMockDraft().then(data => {
                if (data) setMockDraft(data)
            })
        }
    }, [])

    return mockDraft
}

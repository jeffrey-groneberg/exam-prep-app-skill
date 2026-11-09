import { describe, expect, it } from 'vitest'
import { APP_VERSION, feedbackEnabled, feedbackUrl, ISSUES_NEW_URL } from '../src/lib/feedback.ts'
import { exam } from '../src/config.ts'

const ISSUES = 'https://github.com/owner/repo/issues/new'
const parse = (url: string) => new URL(url)

describe('feedback links', () => {
  it('open a new issue with title, label and the place of the problem', () => {
    const url = parse(
      feedbackUrl(
        { subject: 'Question q-agents-vscode-03', details: [['Module', 'agents-vscode'], ['Skill', '2.2.1']], excerpt: 'Your company **needs**\na knowledge base.' },
        { lang: 'en', page: 'https://example.test/app/#/practice/session?module=agents-vscode', version: 'abc1234', issuesUrl: ISSUES },
      ),
    )
    expect(`${url.origin}${url.pathname}`).toBe(ISSUES)
    expect(url.searchParams.get('title')).toBe('Feedback: Question q-agents-vscode-03')
    expect(url.searchParams.get('labels')).toBe('feedback')
    const body = url.searchParams.get('body') ?? ''
    expect(body).toMatch(/^### What’s wrong\?/)
    expect(body).toContain('### Where (filled in automatically)')
    expect(body).toContain('- Area: Question q-agents-vscode-03')
    expect(body).toContain('- Module: agents-vscode')
    expect(body).toContain('- Skill: 2.2.1')
    expect(body).toContain('- Text: “Your company **needs** a knowledge base.”')
    expect(body).toContain('- Page: https://example.test/app/#/practice/session?module=agents-vscode')
    expect(body).toContain('- Content language: English')
    expect(body).toContain('- App version: abc1234')
  })

  it('write headings and labels in the language the app is shown in', () => {
    const body =
      parse(
        feedbackUrl({ subject: 'Frage q-agents-vscode-03', excerpt: 'Dein Agent soll …' }, { lang: 'de', page: 'https://example.test/', version: 'abc1234', issuesUrl: ISSUES }),
      ).searchParams.get('body') ?? ''
    expect(body).toMatch(/^### Was stimmt nicht\?/)
    expect(body).toContain('### Wo (automatisch ausgefüllt)')
    expect(body).toContain('- Bereich: Frage q-agents-vscode-03')
    expect(body).toContain('- Text: „Dein Agent soll …“')
    expect(body).toContain('- Seite: https://example.test/')
    expect(body).toContain('- Sprache der Inhalte: Deutsch')
    expect(body).toContain('- App-Version: abc1234')
  })

  it('clip long excerpts so the link stays far below URL length limits', () => {
    const url = feedbackUrl({ subject: 'Card z-mcp-tools-concept-1', excerpt: 'x'.repeat(5000) }, { lang: 'de', page: 'https://example.test/', issuesUrl: ISSUES })
    const body = parse(url).searchParams.get('body') ?? ''
    expect(body).toMatch(/- Text: „x{159}…“/)
    expect(url.length).toBeLessThan(3000)
  })

  it('are off without an issues URL', () => {
    expect(feedbackUrl({ subject: 'App in general' }, { lang: 'en', page: 'https://example.test/', issuesUrl: '' })).toBe('')
  })

  it('take the issues URL from exam.json feedback.issuesUrl', () => {
    const configured = exam.feedback?.issuesUrl?.trim() ?? ''
    expect(ISSUES_NEW_URL).toBe(configured)
    expect(feedbackEnabled).toBe(configured !== '')
    if (configured) expect(feedbackUrl({ subject: 'App in general' }, { lang: 'en', page: '' }).startsWith(`${configured}?`)).toBe(true)
  })

  it('name the build version, falling back to "dev"', () => {
    expect(APP_VERSION).toMatch(/^([0-9a-f]{7,40}|dev)$/)
  })
})

'use client'

import { useState } from 'react'

interface CitationBoxProps {
  authorNames: string[]
  title: string
  publicationName: string | null
  dateStr: string | null
  recordUrl: string
  accessedDate: string
  citationText: string
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildHtmlCitation(props: CitationBoxProps): string {
  const { authorNames, title, publicationName, dateStr, recordUrl, accessedDate } = props

  const authorStr =
    authorNames.length === 1 ? `${esc(authorNames[0])}.` :
    authorNames.length === 2 ? `${esc(authorNames[0])}, and ${esc(authorNames[1])}.` :
    authorNames.length > 2 ? `${esc(authorNames[0])}, et al.` :
    null

  const punct = /[.?!]$/.test(title) ? '' : '.'
  const parts: string[] = []
  if (authorStr) parts.push(`${authorStr} `)
  parts.push(`“${esc(title)}${punct}” `)
  if (publicationName && !dateStr) parts.push(`<em>${esc(publicationName)}</em>. `)
  if (publicationName && dateStr) parts.push(`<em>${esc(publicationName)}</em>, ${esc(dateStr)}. `)
  if (!publicationName && dateStr) parts.push(`${esc(dateStr)}. `)
  parts.push(`<em>Waterloo Cross-Dressing Archive</em>, <a href="${esc(recordUrl)}">${esc(recordUrl)}</a>. Accessed ${esc(accessedDate)}.`)
  return parts.join('')
}

export default function CitationBox(props: CitationBoxProps) {
  const [copied, setCopied] = useState(false)
  const { authorNames, title, publicationName, dateStr, recordUrl, accessedDate, citationText } = props

  async function handleCopy() {
    const html = buildHtmlCitation(props)
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([citationText], { type: 'text/plain' }),
        }),
      ])
    } catch {
      await navigator.clipboard.writeText(citationText)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const authorStr =
    authorNames.length === 1 ? `${authorNames[0]}.` :
    authorNames.length === 2 ? `${authorNames[0]}, and ${authorNames[1]}.` :
    authorNames.length > 2 ? `${authorNames[0]}, et al.` :
    null

  return (
    <div className="flex items-start gap-2">
      <p className="flex-1 text-sm leading-relaxed text-ink">
        {authorStr && <>{authorStr} </>}
        &ldquo;{title}{/[.?!]$/.test(title) ? '' : '.'}&rdquo;{' '}
        {publicationName && !dateStr && <><em>{publicationName}</em>. </>}
        {publicationName && dateStr && <><em>{publicationName}</em>, {dateStr}. </>}
        {!publicationName && dateStr && <>{dateStr}. </>}
        <em>Waterloo Cross-Dressing Archive</em>,{' '}
        <a href={recordUrl} target="_blank" rel="noopener noreferrer" className="break-all">
          {recordUrl}
        </a>. Accessed {accessedDate}.
      </p>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied!' : 'Copy citation to clipboard'}
        title={copied ? 'Copied!' : 'Copy citation'}
        className="shrink-0 mt-0.5 p-1.5 rounded border border-border bg-paper text-muted hover:text-ink hover:border-muted transition-colors cursor-pointer"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  )
}

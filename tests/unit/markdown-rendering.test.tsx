/** @jest-environment jsdom */

import { render } from '@testing-library/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

function renderMarkdown(source: string) {
  return render(
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
      {source}
    </ReactMarkdown>
  )
}

describe('admin-editable markdown rendering', () => {
  it('renders raw HTML tags instead of escaping them', () => {
    const { container } = renderMarkdown(
      'Some text <img src="https://example.com/x.png" alt="sized" width="120" height="80" /> more text'
    )
    const img = container.querySelector('img[alt="sized"]')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('https://example.com/x.png')
    expect(img?.getAttribute('width')).toBe('120')
    expect(img?.getAttribute('height')).toBe('80')
  })

  it('renders raw inline HTML tags mixed into a paragraph', () => {
    const { container } = renderMarkdown('Some <mark>highlighted</mark> text.')
    const mark = container.querySelector('mark')
    expect(mark?.textContent).toBe('highlighted')
  })

  it('still renders standard markdown syntax', () => {
    const { container } = renderMarkdown('**bold** and a [link](https://example.com)')
    expect(container.querySelector('strong')?.textContent).toBe('bold')
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com')
  })
})

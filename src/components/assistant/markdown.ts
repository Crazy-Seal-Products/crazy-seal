/**
 * Tiny Markdown-to-HTML for assistant answers: paragraphs, bullet and
 * numbered lists, **bold**, `code` and [links](https://…). Everything is
 * escaped first, and only http(s) links are kept, so model output can't
 * inject markup.
 */

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function inline(text: string): string {
  return escape(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, (_, label: string, url: string) => {
      const external = url.startsWith('http') && !/^https?:\/\/(www\.)?crazyseal\.com/i.test(url)
      return `<a href="${url}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''} class="underline underline-offset-2">${label}</a>`
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

export function markdownToHtml(text: string): string {
  const out: string[] = []
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null
  let para: string[] = []

  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(inline).join('<br>')}</p>`)
    para = []
  }
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`)
    list = null
  }

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd()
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/)
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/)
    const heading = line.match(/^#{1,4}\s+(.*)$/)
    if (bullet || numbered) {
      flushPara()
      const tag = bullet ? 'ul' : 'ol'
      if (!list || list.tag !== tag) {
        flushList()
        list = { tag, items: [] }
      }
      list.items.push((bullet ?? numbered)![1])
    } else if (heading) {
      flushPara()
      flushList()
      out.push(`<p><strong>${inline(heading[1])}</strong></p>`)
    } else if (!line.trim()) {
      flushPara()
      flushList()
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara()
  flushList()
  return out.join('')
}

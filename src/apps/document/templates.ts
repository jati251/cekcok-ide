export const DOC_STORAGE_KEY = 'cekcok_document_content_v1'
export const DOC_TITLE_KEY = 'cekcok_document_title_v1'
export const DOC_THEME_KEY = 'cekcok_document_theme_v1'

export function getInitialDocContent() {
  const saved = localStorage.getItem(DOC_STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch (e) {
      console.warn('Failed to parse cached doc:', e)
    }
  }
  return [
    {
      type: 'heading',
      props: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to Cekcok Document', styles: { bold: true } }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'A clean, modern distraction-free word processor built into Cekcok IDE. Type ',
          styles: {},
        },
        { type: 'text', text: '/', styles: { code: true } },
        {
          type: 'text',
          text: ' anywhere to insert headings, tables, bullet lists, code blocks, or images.',
          styles: {},
        },
      ],
    },
    {
      type: 'bulletListItem',
      content: [{ type: 'text', text: '⚡ Real-time auto-saving to local storage', styles: {} }],
    },
    {
      type: 'bulletListItem',
      content: [
        {
          type: 'text',
          text: '📄 Export to Markdown, HTML, Plain Text, or Print to PDF',
          styles: {},
        },
      ],
    },
    {
      type: 'bulletListItem',
      content: [{ type: 'text', text: '🌓 Seamless Dark / Light workspace mode toggle', styles: {} }],
    },
  ]
}

export interface DocTemplate {
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: any[]
}

export function getDocTemplate(type: 'rfc' | 'minutes' | 'notes'): DocTemplate {
  if (type === 'rfc') {
    return {
      title: 'RFC - Engineering Architecture Design.md',
      blocks: [
        {
          type: 'heading',
          props: { level: 1 },
          content: [
            { type: 'text', text: 'RFC: Modern Service Architecture', styles: { bold: true } },
          ],
        },
        {
          type: 'heading',
          props: { level: 2 },
          content: [{ type: 'text', text: '1. Summary & Motivation', styles: {} }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Describe the core objective and background context here.',
              styles: {},
            },
          ],
        },
        {
          type: 'heading',
          props: { level: 2 },
          content: [{ type: 'text', text: '2. Detailed Design', styles: {} }],
        },
        {
          type: 'bulletListItem',
          content: [
            {
              type: 'text',
              text: 'High throughput, sub-millisecond response latency',
              styles: {},
            },
          ],
        },
        {
          type: 'bulletListItem',
          content: [
            {
              type: 'text',
              text: 'Strict type safety with TypeScript & Rust backend',
              styles: {},
            },
          ],
        },
        {
          type: 'heading',
          props: { level: 2 },
          content: [
            { type: 'text', text: '3. Security & Scalability Considerations', styles: {} },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Outline threat models, rate limiting, and caching layers.',
              styles: {},
            },
          ],
        },
      ],
    }
  }

  if (type === 'minutes') {
    return {
      title: 'Weekly Team Meeting Minutes.md',
      blocks: [
        {
          type: 'heading',
          props: { level: 1 },
          content: [
            { type: 'text', text: 'Weekly Sync & Product Agenda', styles: { bold: true } },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text:
                'Date: ' +
                new Date().toLocaleDateString() +
                ' • Attendees: Core Engineering Team',
              styles: { italic: true },
            },
          ],
        },
        {
          type: 'heading',
          props: { level: 2 },
          content: [{ type: 'text', text: 'Action Items', styles: {} }],
        },
        {
          type: 'checkListItem',
          content: [{ type: 'text', text: 'Deliver desktop auto-updater flow', styles: {} }],
        },
        {
          type: 'checkListItem',
          content: [{ type: 'text', text: 'Complete spreadsheet template gallery', styles: {} }],
        },
        {
          type: 'checkListItem',
          content: [
            {
              type: 'text',
              text: 'Validate cross-platform DMG/tar.gz packaging',
              styles: {},
            },
          ],
        },
      ],
    }
  }

  return {
    title: 'Release Notes & Feature Specs.md',
    blocks: [
      {
        type: 'heading',
        props: { level: 1 },
        content: [
          { type: 'text', text: 'Cekcok IDE v0.2.0 Release Spec', styles: { bold: true } },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text:
              'Overview of new core improvements and bug fixes across all workspaces.',
            styles: {},
          },
        ],
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: [{ type: 'text', text: 'Key Highlights', styles: {} }],
      },
      {
        type: 'bulletListItem',
        content: [
          {
            type: 'text',
            text: '⭐ Unified TitleBar & macOS Traffic Light window drag support',
            styles: {},
          },
        ],
      },
      {
        type: 'bulletListItem',
        content: [
          {
            type: 'text',
            text: '📊 Full-featured Excel Spreadsheet with XLSX/CSV import & export',
            styles: {},
          },
        ],
      },
      {
        type: 'bulletListItem',
        content: [
          {
            type: 'text',
            text: '📝 Notion-grade Word Processor with Markdown & PDF export',
            styles: {},
          },
        ],
      },
      {
        type: 'bulletListItem',
        content: [
          {
            type: 'text',
            text: '🎨 Vector Whiteboard with PNG/SVG exports and diagram tools',
            styles: {},
          },
        ],
      },
    ],
  }
}

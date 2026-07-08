/**
 * The Index — typographic ledger on the homepage.
 * One MDX file per project is the goal; this flat array is fine at launch.
 * Add new rows here as projects ship.
 */
export interface IndexRow {
  title: string;
  description: string;
  stack: string;
  year: string; /* roman numeral */
  status: 'LIVE' | 'ARCHIVE' | string;
  href: string;
  external: boolean;
}

export const indexRows: IndexRow[] = [
  {
    title: 'SHROOM',
    description: 'AI hallucination detector',
    stack: 'PyTorch · HuggingFace',
    year: 'MMXXV',
    status: '↗',
    href: 'https://github.com/mohit-xv/AI-hallucination_Detector',
    external: true,
  },
  {
    title: 'Feedback Analyser',
    description: 'customer sentiment pipeline',
    stack: 'Python · AWS',
    year: 'MMXXVI',
    status: '↗',
    href: 'https://github.com/mohit-xv/customer_feedback_analyser',
    external: true,
  },
  {
    title: 'Video edits',
    description: 'commissioned work',
    stack: 'Premiere · After Effects',
    year: 'MMXXIV',
    status: '↗',
    href: '#', // TODO: supply reel / portfolio link
    external: true,
  },
  {
    title: 'GitHub',
    description: 'all public work',
    stack: '@mohit-xv',
    year: 'LIVE',
    status: 'LIVE',
    href: 'https://github.com/mohit-xv',
    external: true,
  },
];

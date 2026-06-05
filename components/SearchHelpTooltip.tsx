export default function SearchHelpTooltip() {
  return (
    <span className="relative group inline-flex items-center">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-border text-muted text-[10px] cursor-default select-none leading-none">
        ?
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded border border-border bg-paper text-ink shadow-md px-3 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50">
        Multiple words are ANDed (all must appear). Use{' '}
        <code className="font-mono">&quot;quotes&quot;</code> for exact phrases,{' '}
        <code className="font-mono">OR</code> between terms, or{' '}
        <code className="font-mono">-word</code> to exclude a term.
      </span>
    </span>
  )
}

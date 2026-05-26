export default function RecordLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      <div className="h-4 w-56 bg-border rounded mb-5" />
      <div className="p-4 sm:p-8 bg-paper border border-border rounded">
        <div className="h-3 w-28 bg-border rounded mb-3" />
        <div className="h-7 w-3/4 bg-border rounded mb-2" />
        <div className="h-4 w-36 bg-border rounded mb-6 pb-4 border-b border-border" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-border rounded" style={{ width: `${92 - i * 6}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

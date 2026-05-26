export default function PersonLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      <div className="h-4 w-56 bg-border rounded mb-5" />
      <div className="mb-6 p-5 sm:p-7 rounded bg-paper border border-border">
        <div className="h-3 w-28 bg-border rounded mb-3" />
        <div className="h-8 w-2/3 bg-border rounded mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-24 bg-border rounded-full" />
          <div className="h-6 w-20 bg-border rounded-full" />
        </div>
        <div className="h-4 w-full bg-border rounded mb-2" />
        <div className="h-4 w-5/6 bg-border rounded" />
      </div>
      <div className="mb-6 h-40 bg-paper border border-border rounded" />
      <div className="mb-6 h-56 bg-paper border border-border rounded" />
    </div>
  )
}

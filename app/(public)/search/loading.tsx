export default function SearchLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div
        className="h-8 w-48 rounded mb-6"
        style={{ backgroundColor: 'var(--color-border)', animation: 'pulse 1.5s ease-in-out infinite' }}
      />
      <div className="flex flex-col lg:flex-row gap-6">
        <div
          className="w-full lg:w-64 shrink-0 rounded"
          style={{
            height: '400px',
            backgroundColor: 'var(--color-border)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div className="flex-1 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded"
              style={{
                height: '56px',
                backgroundColor: 'var(--color-border)',
                opacity: 1 - i * 0.08,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

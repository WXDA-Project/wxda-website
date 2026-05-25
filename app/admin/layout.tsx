export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-ink text-paper px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <span className="text-sm font-semibold tracking-wide font-serif">
          WXDA Admin
        </span>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="text-xs underline opacity-70 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer text-paper"
          >
            Sign out
          </button>
        </form>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        {children}
      </main>
    </>
  )
}

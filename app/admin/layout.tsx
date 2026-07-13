import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-ink text-paper px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <nav className="flex items-center gap-5">
          <span className="text-sm font-semibold tracking-wide font-serif">WXDA Admin</span>
          <Link href="/admin/fields" className="text-xs opacity-70 hover:opacity-100 transition-opacity text-paper no-underline">
            Fields
          </Link>
          <Link href="/admin/blog" className="text-xs opacity-70 hover:opacity-100 transition-opacity text-paper no-underline">
            Blog
          </Link>
          <Link href="/admin/news" className="text-xs opacity-70 hover:opacity-100 transition-opacity text-paper no-underline">
            News
          </Link>
          <Link href="/admin/advisory-board" className="text-xs opacity-70 hover:opacity-100 transition-opacity text-paper no-underline">
            Advisory Board
          </Link>
          <Link href="/admin/pages" className="text-xs opacity-70 hover:opacity-100 transition-opacity text-paper no-underline">
            Page Content
          </Link>
        </nav>
        <form action="/api/auth/signout" method="POST">
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

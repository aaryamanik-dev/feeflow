import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
        <div className="text-xl font-bold text-teal-700">FeeFlow</div>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600">
            Sign In
          </Link>
          <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900">
            Manage Your School’s Finances in One Place
          </h1>
          <p className="text-lg text-slate-600">
            Track student fees, staff payments, income, and operational expenses — without scattered registers and spreadsheets.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="px-6 py-3 text-base font-medium text-white bg-teal-600 rounded-md shadow hover:bg-teal-700">
              Create School Workspace
            </Link>
            <Link href="/login" className="px-6 py-3 text-base font-medium text-teal-700 bg-white border border-teal-300 rounded-md shadow-sm hover:bg-slate-50">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200">
        FeeFlow — School financial management workspace.
      </footer>
    </div>
  )
}
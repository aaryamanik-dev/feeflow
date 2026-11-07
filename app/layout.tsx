import './globals.css'

export const metadata = {
  title: 'FeeFlow',
  description: 'Manage Your School’s Finances in One Place',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 text-slate-900">
        {children}
      </body>
    </html>
  )
}
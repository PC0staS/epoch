export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">My App</h1>
      </header>
      <main className="flex-grow p-4">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        &copy; {new Date().getFullYear()} My App. All rights reserved.
      </footer>
    </div>
  )
}

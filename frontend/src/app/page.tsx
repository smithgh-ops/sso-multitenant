import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Multi-Tenant News Application
        </h1>
        
        <div className="text-center space-y-4">
          <p className="text-lg mb-8">
            Welcome to the multi-tenant news platform with SSO authentication.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/articles"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Browse Articles
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🔐 SSO Authentication</h3>
            <p className="text-gray-600">Secure single sign-on across all tenant applications.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🏢 Multi-Tenant</h3>
            <p className="text-gray-600">Isolated data and customization for each tenant.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">📰 News Management</h3>
            <p className="text-gray-600">Full-featured content management for news articles.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

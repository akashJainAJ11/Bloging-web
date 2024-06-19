// pages/404.js

import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-8">Page Not Found</p>
      <Link href="/"
         className="text-blue-500 hover:text-blue-700 text-lg">
          Go back to Home
      </Link>
    </div>
  );
}

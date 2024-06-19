"use client";
import { signout } from "@/lib/route";
import { useState } from 'react';
import Link from 'next/link';

export default function NavBar({ session }:any) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleSignOut = () => signout();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold">
          <Link href='/'>blog-web</Link>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/" className="hover:text-gray-300">Home</Link>
          <Link href="/blog" className="hover:text-gray-300">Blogs</Link>
          <Link href="/createpost" className="hover:text-gray-300">CreatePost</Link>
          {session && session.user && (
            <div className="relative">
              <div
                className="cursor-pointer bg-gray-700 rounded-full h-10 w-10 flex items-center justify-center text-lg"
                onClick={toggleDropdown}
              >
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      SignOut
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="outline-none">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden">
          <Link href="/" className="block px-4 py-2 hover:bg-gray-700">Home</Link>
          <Link href="/blog" className="block px-4 py-2 hover:bg-gray-700">Blogs</Link>
          <Link href="/createpost" className="block px-4 py-2 hover:bg-gray-700">CreatePost</Link>
          {session && session.user && (
            <div className="relative">
              <div
                className="cursor-pointer bg-gray-700 rounded-full h-10 w-10 flex items-center justify-center text-lg mt-2"
                onClick={toggleDropdown}
              >
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      SignOut
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

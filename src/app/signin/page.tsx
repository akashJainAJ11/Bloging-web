import { getSession, signIn } from "@/lib/route"; // Adjust the import path
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getSession();

  // If the user is already signed in, redirect to the dashboard or another page
  if (session) {
    redirect('/dashboard');
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>
        <form
          className="space-y-4"
          action={async (formData) => {
            "use server"; // Mark this function to be executed on the server
            try {
              await signIn(formData);
              redirect('/dashboard'); // Redirect to dashboard or home page upon successful sign in
            } catch (error) {
              console.error("Sign in failed:", error);
              // Handle sign-in error (e.g., show a message to the user)
            }
          }}
        >
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
            name="email"
            type="email"
            placeholder="Email"
            required
          />
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/signup">
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

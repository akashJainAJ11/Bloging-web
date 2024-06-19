import { signIn } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function SignIn() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>
        <form
          className="space-y-4"
          action={async (formData) => {
            "use server";
            const email = formData.get("email");
            const password = formData.get("password");
  
            if (!email || !password) {
              return;
            }
  
            await signIn("credentials", { email, password });
          }}
        >
          <label className="block">
            <span className="block text-gray-700">Email</span>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
              name="email"
              type="email"
              required
            />
          </label>
          <label className="block">
            <span className="block text-gray-700">Password</span>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
              name="password"
              type="password"
              required
            />
          </label>
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

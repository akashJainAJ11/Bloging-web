
import { getSession, signup, signout } from "@/lib/route";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
    return (
      <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Signup</h2>
          <form
            className="space-y-4"
            action={async (formData) => {
              "use server";
              await signup(formData);
              redirect('/');
            }}
          >
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
              name="name"
              type="name"
              placeholder="Name"
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
              name="email"
              type="email"
              placeholder="Email"
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
              name="password"
              type="password"
              placeholder="Password"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Signup
            </button>
          </form>
        </div>
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mt-6">
          <form
            action={async () => {
              "use server";
              await signout();
            }}
          >
            <button
              type="submit"
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </form>
          <div className="text-center mt-4">
            <Link href="/signin">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Sign in
              </button>
            </Link>
          </div>
        </div>
        {/* <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mt-6">
          <pre className="text-left text-gray-700">{JSON.stringify(session, null, 2)}</pre>
        </div> */}
      </section>
    );    
}
"use server"
import prisma from "@/db";
import { getSession } from "@/lib/route";
import Link from 'next/link'
import { redirect } from "next/navigation";
import NavBar from "./Navbar";

export const LandingPage = async () => {
    const session = await getSession();
    if (!session) {
        redirect('/signin')
    }
    const userName = session.user?.name || "Guest";

    const posts = await prisma.post.findMany();

    return (
        <section>
            <Navbar />
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="mb-6">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">Welcome, {userName}</p>
                </div>
                <div>
                    <Link href='/createpost'>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 sm:px-6 md:px-8 rounded shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                            Create Post
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );    
}


export async function Navbar(){
    const session = await getSession();
    if (!session) {
        redirect('/signin')
    }

    return(
        <NavBar session={session} />
    )

}
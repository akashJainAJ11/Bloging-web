import { getSession } from "@/lib/route";
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import prisma from '@/db';
import { redirect } from "next/navigation";
import { Navbar } from "../components/LandingPage";
import sanitizeHtml from "sanitize-html";
import parse from "html-react-parser";
import Link from 'next/link'; 

export default async function Dashboard() {
  
  const session = await getSession();
  if (!session) {
    redirect('/signin');
  }

  const id = session.user?.id || '';

  const user = await prisma.user.findUnique({
    where: { id },
    include: { posts: true },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <section>
      <Navbar />
      <div className="p-6">
        <div className="flex items-center space-x-4">
          {user.image ? (
            <Image src={user.image} alt={user.name || 'User'} width={50} height={50} className="rounded-full" />
          ) : (
            <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold">Posts</h2>
          <p>Total posts: {posts.length}</p>
          <div className="mt-4 grid grid-cols-1 gap-4">
            {posts.map((post) => {
              const sanitizedTitle = sanitizeHtml(post.title, {
                allowedTags: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                allowedAttributes: {},
              });
              return (
                <Link href={`/blog/${post.id}`} key={post.id}>
                  <div className="p-4 bg-white rounded shadow cursor-pointer">
                    <div className="text-lg font-bold">{parse(sanitizedTitle)}</div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

import prisma from "@/db";
import { getSession } from "@/lib/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import parse from 'html-react-parser';
import { formatDistanceToNow } from 'date-fns';

export default async function CreateCard() {
  const session = await getSession();
  if (!session) {
    redirect('/signin');
  }

  const posts = await prisma.post.findMany({
    include: {
      author: true
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {posts.map(post => (
        <Link key={post.id} href={`/blog/${post.id}`} passHref>
          <PostCard post={post} />
        </Link>
      ))}
    </div>
  );
}

function PostCard({ post }: any) {
  const sanitizedTitle = sanitizeHtml(post.title, {
    allowedTags: sanitizeHtml.defaults.allowedTags,
    allowedAttributes: sanitizeHtml.defaults.allowedAttributes,
  });

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg p-6 bg-white cursor-pointer mx-auto md:max-w-md lg:max-w-lg xl:max-w-xl">
      <div className="flex flex-col sm:flex-row items-center mb-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
          {post.author.name.charAt(0).toUpperCase()}
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 flex-1">
          <div className="font-bold text-xl break-words sm:truncate">{parse(sanitizedTitle)}</div>
          <p className="text-gray-700 text-base">By {post.author.name}</p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt))} ago
          </p>
        </div>
      </div>
    </div>
  );
}

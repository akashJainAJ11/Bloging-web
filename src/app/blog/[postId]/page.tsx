import prisma from "@/db";
import sanitizeHtml from "sanitize-html";
import parse from "html-react-parser";
import { Navbar } from "@/app/components/LandingPage";
import { formatDistanceToNow } from 'date-fns';

export default async function Page({ params }: any) {
  const id = params.postId;

  const post = await prisma.post.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      author: true,
    },
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  const sanitizedTitle = sanitizeHtml(post.title, {
    allowedTags: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    allowedAttributes: {},
  });

  const sanitizedContent = sanitizeHtml(post.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags,
    allowedAttributes: sanitizeHtml.defaults.allowedAttributes,
  });
  const authorName = post.author.name || 'Unknown Author';

  return (
    <section>
      <Navbar />
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center text-xl">
              {authorName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-semibold text-gray-800">{parse(sanitizedTitle)}</h1>
            <p className="text-gray-500">Posted by: {post.author.name}</p>
          </div>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt))} ago
          </p>
        </div>
        <div className="prose text-gray-700">{parse(sanitizedContent)}</div>
      </div>
    </section>
  );
}

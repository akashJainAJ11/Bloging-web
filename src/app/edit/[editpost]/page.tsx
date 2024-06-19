"use client"
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useSession } from "next-auth/react";
import NavBar from '@/app/components/Navbar';
import prisma from '@/db'; // Adjust the path as per your project structure

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
}

interface State {
  message: string;
  error: string | null;
  post: Post | null;
}

interface EditPostFormProps {
  params: { editpost: string };
}

const EditPostForm = ({ params }: EditPostFormProps) => {
  const postId = parseInt(params.editpost, 10);
  console.log("abc",postId);
  const [post, setPost] = useState<Post | null>(null);
  const [pending, setPending] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const loadPost = async () => {
      try {
        const post = await prisma.post.findUnique({
          where: { id: postId },
        });
        if (post) setPost(post);
        console.log("psot: ",)
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    loadPost();
  }, [postId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    try {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { title: post?.title, content: post?.content },
      });
      setPost(updatedPost);
      setPending(false);
      alert('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gray-800 p-4">
        <NavBar session={session} />
      </header>
      <main className="flex-grow flex items-center justify-center bg-gray-100 p-4">
        <section className="w-full max-w-2xl mx-auto p-4 bg-white rounded shadow-md">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <label htmlFor="title" className="font-semibold text-lg">Title</label>
            <ReactQuill
              theme="snow"
              value={post?.title || ''}
              onChange={(value) => setPost(post => post ? { ...post, title: value } : null)}
              className="bg-white p-2 rounded"
            />
            <label htmlFor="content" className="font-semibold text-lg">Content</label>
            <ReactQuill
              theme="snow"
              value={post?.content || ''}
              onChange={(value) => setPost(post => post ? { ...post, content: value } : null)}
              className="bg-white p-2 rounded"
            />
            <button type="submit" disabled={pending} className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Submit
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default EditPostForm;

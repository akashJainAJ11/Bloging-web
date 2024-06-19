"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { createPost } from '@/lib/route';
import { useSession } from "next-auth/react"
import NavBar from './Navbar';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
}

interface CreatePostResponse {
  message?: string;
  error?: { message: string } | null;
  id?: number;
  title?: string;
  content?: string;
  published?: boolean;
}

interface State {
  message: string;
  error: { message: string } | null;
  data: Post | null;
}

interface CreatePostFormProps {
  session: any;
}

const initialState: State = {
  message: '',
  error: null,
  data: null,
};

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button 
      type="submit" 
      disabled={pending} 
      className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      Submit
    </button>
  );
}

export default function CreatePostForm() {
  const [state, setState] = useState<State>(initialState);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { data: session, status } = useSession();
  

  const formAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    const result: CreatePostResponse = await createPost(formData);

    if (result.error) {
      setState({ message: result.message || '', error: result.error, data: null });
    } else if (result.id) {
      const post: Post = {
        id: result.id,
        title: result.title!,
        content: result.content!,
        published: result.published!,
      };
      setState({ message: 'Post created successfully', error: null, data: post });
    }
    setPending(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gray-800 p-4">
        <NavBar session={session} />
      </header>
      <main className="flex-grow flex items-center justify-center bg-gray-100 p-4">
        <section className="w-full max-w-2xl mx-auto p-4 bg-white rounded shadow-md">
          <form onSubmit={formAction} className="flex flex-col space-y-4">
            <label htmlFor="title" className="font-semibold text-lg">Title</label>
            <ReactQuill
              theme="snow"
              value={title}
              onChange={setTitle}
              className="bg-white p-2 rounded"
            />
            <label htmlFor="content" className="font-semibold text-lg">Content</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className="bg-white p-2 rounded"
            />
            <p aria-live="polite" className="text-red-500">
              {state.message}
              {state.error && <span>{state.error.message}</span>}
            </p>
            <SubmitButton pending={pending} />
          </form>
        </section>
      </main>
    </div>
  );
}

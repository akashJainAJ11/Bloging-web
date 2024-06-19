
import { getSession } from '@/lib/route';
import CreatePostForm from '@/app/components/CreatePostForm';
import { redirect } from 'next/navigation';

export default async function CreatePostPage() {
  const session = await getSession();
  if (!session) {
    redirect('/signin');
  }

  return <CreatePostForm session={session} />;
}

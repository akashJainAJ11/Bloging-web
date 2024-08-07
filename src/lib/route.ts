"use server"
import prisma from "@/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { ZodError, any, z } from "zod";
import { revalidatePath } from "next/cache";

const secretKey = process.env.SECRET_KEY || "secret";
const key = new TextEncoder().encode(secretKey);


export async function encrypt(payload: any){
    return await new SignJWT(payload)
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime('365Days')
    .sign(key);
}

export async function decrypt(input: string): Promise<any>{
    const {payload} = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload;
}


export async function signout(){
    cookies().set("session", "", {expires: new Date(0)});
}



interface user {
    email : string,
    name: string,
    password: string
}

export async function signup(formData: FormData) {
  const getStringValue = (value: FormDataEntryValue | null): string | undefined => {
      return typeof value === 'string' ? value : undefined;
  };

  const user = {
      email: getStringValue(formData.get("email")),
      name: getStringValue(formData.get("name")),
      password: getStringValue(formData.get("password"))
  };

  if (!user.email || !user.name || !user.password) {
      return NextResponse.json({
          error: "Any value is null or invalid"
      }, {
          status: 400
      });
  }

  try {
      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({
          where: {
              email: user.email
          },
      });

      if (existingUser) {
          return NextResponse.json({ error: "Email in use" }, {
              status: 409
          });
      }

      // Hash the user's password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Create the new user in the database
      const DBuser = await prisma.user.create({
          data: {
              name: user.name,
              email: user.email,
              password: hashedPassword
          },
          select: {
              id: true,
              name: true,
              email: true
          }
      });

      // Include user ID in the session
      const sessionUser = {
          id: DBuser.id,
          email: user.email,
          name: user.name
      };
      
      // Encrypt the session
      const expires = new Date(Date.now() + 31536000);
      const session = await encrypt({ user: sessionUser, expires });

      // Set the session cookie
      cookies().set("session", session, { expires, httpOnly: true });

      return NextResponse.json({ 
          message: "User created successfully", 
          user: sessionUser
      }, { status: 200 });

  } catch (error) {
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}


export async function signIn(formData: FormData) {
  const getStringValue = (value: FormDataEntryValue | null): string | undefined => {
    return typeof value === 'string' ? value : undefined;
  };

  const userCredentials = {
    email: getStringValue(formData.get("email")),
    password: getStringValue(formData.get("password"))
  };

  if (!userCredentials.email || !userCredentials.password) {
    return NextResponse.json({
      error: "Any value is null or invalid"
    }, {
      status: 400
    });
  }

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email: userCredentials.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Compare the passwords
    const isPasswordValid = await bcrypt.compare(userCredentials.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Include user ID in the session
    const sessionUser = { id: user.id, email: user.email, name: user.name };
    
    // Encrypt the session
    const expires = new Date(Date.now() + 31536000); // 1 year
    const session = await encrypt({ user: sessionUser, expires });

    // Set the session cookie
    cookies().set("session", session, { expires, httpOnly: true });

    return NextResponse.json({ message: "User signed in successfully", user: sessionUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function getSession(){
    const session = cookies().get("session")?.value;
    if(!session) return null;
    return await decrypt(session);
}



interface CreatePostResponse {
  message?: string;
  error?: { message: string } | null;
  id?: number;
  title?: string;
  content?: string;
  published?: boolean;
}

export async function createPost(formData: FormData): Promise<CreatePostResponse> {
    const session = await getSession();
    if (!session || !session.user) {
      return { error: { message: 'Not authenticated' } };
    }

    console.log("session: ", session)

  const schema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  });

  const parseResult = schema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!parseResult.success) {
    return {
      message: 'Validation failed',
      error: { message: parseResult.error.errors.map(e => e.message).join(', ') },
    };
  }

  const blog = parseResult.data;
  const user = session.user;
  const id = session.user?.id;

  if (!user) {
    return {
      error: { message: 'user value is null' },
    };
  }
  try {
    const post = await prisma.post.create({
      data: {
        title: blog.title,
        content: blog.content,
        authorId: id,
        published: false,
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
      },
    });
    revalidatePath('/');
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published,
    };
  } catch (error) {
    console.error('Failed to create post:', error);
    return {
      error: { message: 'Failed to create post' },
    };
  }
}



// This function now toggles like/unlike based on the current state and updates the like count.
export async function createLike(postId: any) {
  const session = await getSession();
  if (!session || !session.user) {
    return { error: { message: 'Not authenticated' } };
  }

  const userId = session.user.id;
  console.log("Session24: ", session)

  const existingLike = await prisma.like.findFirst({
    where: {
      userId: userId,
      postId: postId,
    },
  });

  if (existingLike) {
    // User has already liked the post, remove the like
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        likeCount: {
          decrement: 1,
        },
      },
    });

    return { likeCount: updatedPost.likeCount, isLiked: false };
  } else {
    // User has not liked the post yet, add a like
    await prisma.like.create({
      data: {
        userId: userId,
        postId: postId,
      },
    });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    });

    return { likeCount: updatedPost.likeCount, isLiked: true };
  }
}
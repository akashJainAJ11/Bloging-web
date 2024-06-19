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

export async function signup(formData: FormData){

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

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const expires = new Date(Date.now() + 31536000)
        const session = await  encrypt({ user, expires });

        cookies().set("session", session, {expires, httpOnly: true})

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
        return NextResponse.json({ 
            message: "User created successfully", 
            user: {
                id: DBuser.id || null,
                name: DBuser.name || null,
                email: DBuser.email || null
            }
        }, {status: 200});
        
    } catch (error) {
        return NextResponse.json({ error: 'An unexpected error occurred' }, {status: 500});
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

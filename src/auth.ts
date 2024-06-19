import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/db";
import { ZodError } from "zod";
import { signInSchema } from "@/lib/zod";
import type { Provider } from "next-auth/providers";
import { cookies } from "next/headers";
import { SignJWT } from "jose";



const secretKey = process.env.SECRET_KEY || "secret";
const key = new TextEncoder().encode(secretKey);



export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime('365Days')
        .sign(key);
}

const providers: Provider[] = [
    Credentials({
        credentials: {
            email: {},
            password: {},
        },
        authorize: async (credentials: any): Promise<any> => {
            try {
                let user = null;

                const { email, password } = await signInSchema.parseAsync(credentials);

                user = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                    select: {
                        id: true,
                        name: true,
                        password: true,
                    },
                });

                if (!user) {
                    return { data: null };
                }

                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!passwordMatch) {
                    return { data: null };
                }

                if (await bcrypt.compare(password, user.password)) {

                    const expires = new Date(Date.now() + 31536000)
                    const session = await encrypt({ user, expires });

                    cookies().set("session", session, { expires, httpOnly: true })

                }
                console.log("user: ", user)
                return user;
            } catch (error) {
                if (error instanceof ZodError) {
                    // Return `null` to indicate that the credentials are invalid
                    return null
                }
            }
        }

    }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers,
    callbacks: {
        async redirect({ url, baseUrl }) {
            return '/';
          },
    }
});

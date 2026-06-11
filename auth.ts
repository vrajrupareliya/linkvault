import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/db/prisma";

 
export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/sign-in",
    },


    providers: [
        Credentials({
        credentials: {
            email: {label: "Email", type: "email" },
            password: {label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                console.log("Email or password is missing");
                return null;
            }

            const user = await prisma.user.findUnique({
                where: { email: credentials.email as string },
            });

            console.log("User found:", user);

            if (!user || ! user.password) {
                console.log("User not found or invalid password");
                return null;

            }

            const isPasswordValid = await bcrypt.compare(
                credentials.password as string,
                user.password
            );

            if (!isPasswordValid) {
                console.log("Invalid password");
                return null;
            }

        // return user object with their profile data
        return {
            _id: user.id,
            email: user.email,
            name: user.username,
            isactive: user.isActive,
        }
      },
    }),
  ],

    callbacks: {
        async jwt({user, token}) {
            if (user) {
                token._id = user._id?.toString()
                token.username = user.username
            }

            return token;
        },
        async session({session, token}) {
            if (session.user) {
                session.user._id = token._id as string;
                session.user.username = token.username as string;
            }
            return session;
        },
    },
});
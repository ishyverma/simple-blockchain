import prisma from "@repo/db/client";
import { AuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      username: string;
      id: string;
    } & DefaultSession["user"];
  }
  interface User {
    username: string;
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    id: string;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "••••••••",
        },
        type: { label: "Type", type: "text", placeholder: "Miner / User" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        const { username, password, type } = credentials;
        if (type === "Miner") {
          const miner = await prisma.miner.findUnique({
            where: {
              username,
            },
          });
          if (miner && (await bcrypt.compare(password, miner.password))) {
            return miner;
          }
          return null;
        } else {
          const user = await prisma.user.findUnique({
            where: {
              username,
            },
          });
          if (user && (await bcrypt.compare(password, user.password))) {
            return user;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.username = token.username;
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "s3cr3t",
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
} satisfies AuthOptions;

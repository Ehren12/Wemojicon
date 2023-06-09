import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { filteredUserForClient } from "~/server/helpers/filterUserForClient";
import type { Post } from "@prisma/client";

const appendUserDataToPost = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filteredUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);
    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });
    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postRouter = createTRPCRouter({
  getById: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });
      if (!post)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No Post exists with that is",
        });
      return (await appendUserDataToPost([post]))[0];
    }),
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).nullable(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 5;
      const { cursor } = input;
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
      });
      let nextCursor: typeof cursor | null = null;
      if (posts.length > limit) {
        const nextPost = posts.pop();
        nextCursor = nextPost!.id;
      }

      return appendUserDataToPost(posts).then((result) => {
        // attach a callback function
        return { result, nextCursor }; // return an object with the result and the nextCursor
      });
    }),
  getAllPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(appendUserDataToPost)
    ),
  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .emoji("We only do emojis around here 🙄")
          .min(1)
          .max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});

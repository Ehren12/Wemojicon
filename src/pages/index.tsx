import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Image from "next/image";

import { api } from "~/utils/api";

import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PostView } from "~/components/postview";
import { PageLayout } from "~/components/layout";

import { onPromise, useEmoji } from "~/clientHelpers/helperFunctions";
import { useCallback, useEffect, useState } from "react";

dayjs.extend(relativeTime);

const schema = z.object({
  emoji: z.string().emoji(`, we only do emojis here 😒`).min(1).max(280),
});

type Input = z.infer<typeof schema>;

const CreatePostWizard = () => {
  const { user } = useUser();
  const { emoji } = useEmoji();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Input>({
    defaultValues: {
      emoji: "",
    },
    resolver: zodResolver(schema),
  });
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setValue("emoji", "");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post your emoji 😔. Try again later!");
      }
      setValue("emoji", "");
    },
  });
  if (!user || !user.firstName) return null;
  const onSubmit = (data: Input) => {
    mutate({ content: data.emoji });
  };

  return (
    <div className="flex w-full gap-3">
      <form
        className="flex grow items-center justify-center"
        onSubmit={onPromise(handleSubmit(onSubmit))}
      >
        <div className="flex grow flex-col">
          <input
            placeholder={`Hi, ${user.firstName} type here ${emoji}`}
            className="grow bg-transparent outline-none"
            type="text"
            defaultValue={""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const emojiValue = watch("emoji");
                if (emojiValue.trim() !== "") {
                  const input = { content: emojiValue };
                  mutate(input);
                }
              }
            }}
            disabled={isPosting}
            {...register("emoji")}
          />

          {errors.emoji && (
            <p className="text-bold text-red-600">
              {user.firstName}
              {errors.emoji?.message}
            </p>
          )}
        </div>
        {watch("emoji") !== "" && !isPosting && (
          <button
            type="submit"
            className="h-fit rounded bg-[#5D675B] px-4 py-2 text-slate-200"
          >
            Post
          </button>
        )}
        {isPosting && (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={20} />
          </div>
        )}
      </form>
    </div>
  );
};

const Feed = () => {
  const postQuery = api.posts.getAll.useInfiniteQuery(
    { limit: 5 },
    { getNextPageParam: (lastpage) => lastpage.nextCursor }
  );
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = postQuery;

  // list of emojis already rendered
  const [posts, setPosts] = useState(() => {
    const emojiPost = postQuery.data?.pages
      .map((page) => page.result.map((item) => item).flat())
      .flat();
    return emojiPost;
  });
  type Post = NonNullable<typeof posts>[number];

  const addMessages = useCallback((incoming?: Post[]) => {
    setPosts((current) => {
      const map: Record<Post["post"]["id"], Post> = {};
      for (const msg of current ?? []) {
        map[msg.post.id] = msg;
      }
      for (const msg of incoming ?? []) {
        map[msg.post.id] = msg;
      }
      return Object.values(map).sort(
        (a, b) => b.post.createdAt.getTime() - a.post.createdAt.getTime()
      );
    });
  }, []);

  useEffect(() => {
    const emojiPost = postQuery.data?.pages
      .map((page) => page.result.map((item) => item).flat())
      .flat();
    addMessages(emojiPost);
  }, [postQuery.data?.pages, addMessages]);

  if (postQuery.isLoading) return <LoadingPage />;
  if (!postQuery.data) return <div>Whoops...Seems something wen wrong</div>;
  return (
    <div className="flex flex-col">
      {posts?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
      {hasNextPage ? (
        <button
          data-testid="loadMore"
          onClick={onPromise(() => fetchNextPage())}
          className="bg-indigo-500 px-4 py-2 text-white disabled:opacity-40"
        >
          {isFetchingNextPage ? "Loading more..." : hasNextPage && "Load More"}
        </button>
      ) : (
        <div className="flex items-center justify-center p-4">
          <p className="font-bold">{`🥳 You've reached the end!`}</p>
        </div>
      )}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const emoji = useEmoji();
  // Start fetching immediately
  api.posts.getAll.useInfiniteQuery(
    { limit: 5 },
    { getNextPageParam: (lastpage) => lastpage.nextCursor }
  );
  //Return empty div if user isn't loaded yet
  if (!userLoaded)
    return (
      <div className="flex h-screen w-screen items-center justify-center text-6xl">
        {emoji.emoji}
      </div>
    );
  return (
    <PageLayout>
      <div className="flex border-b border-[#0E1C36]/20 bg-[#F5F5F5] p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;

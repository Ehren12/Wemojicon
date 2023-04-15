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

dayjs.extend(relativeTime);

const schema = z.object({
  emoji: z.string().emoji("only emojis man").min(1).max(280),
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
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
        priority
      />
      <form className="flex grow" onSubmit={onPromise(handleSubmit(onSubmit))}>
        <div className="flex flex-col grow">
        <input
          placeholder={`Hi, ${user.firstName} emote your feelings ${emoji}`}
          className="grow bg-transparent outline-none"
          type="text"
          defaultValue={""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (watch("emoji") !== "") {
                onSubmit;
              }
            }
          }}
          disabled={isPosting}
          {...register("emoji")}
        />
        {errors.emoji && <p className="text-bold text-red-600">{errors.emoji?.message}</p>}
        </div>
        {watch("emoji") !== "" && !isPosting && (
          <button type="submit" className="">Post</button>
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
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();
  if (postLoading) return <LoadingPage />;
  if (!data) return <div>Whoops...Seems something wen wrong</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const emoji = useEmoji();
  // Start fetching immediately
  api.posts.getAll.useQuery();
  //Return empty div if user isn't loaded yet
  if (!userLoaded)
    return (
      <div className="flex h-screen w-screen items-center justify-center text-6xl">
        {emoji.emoji}
      </div>
    );
  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
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

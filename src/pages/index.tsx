import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { useEmoji } from "~/helperFunctions";
import { PostView } from "~/components/postview";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const {emoji} = useEmoji()
  const [input, setInput] = useState<string>("");
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post your emoji 😔. Try again later!");
      }
      setInput("")
    },
  });
  if (!user || !user.firstName) return null;
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
      <input
        placeholder={`Hi, ${user.firstName} emote your feelings ${emoji}`}
        className="grow bg-transparent outline-none"
        type="string"
        value={input}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })} disabled={isPosting}>
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
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
  if (!userLoaded) return <div className="flex h-screen w-screen justify-center items-center text-6xl">{emoji.emoji}</div>;
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

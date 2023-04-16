import { SignOutButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  const router = useRouter();
  const { isSignedIn } = useUser();

  return (
    <main className="flex h-screen justify-center">
      <article className="flex h-full w-full flex-col overflow-auto border-x border-slate-400 scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-600 scrollbar-thumb-rounded-full md:max-w-2xl">
        <nav className="flex flex-row justify-between p-4 bg-slate-800">
          {" "}
          {router.pathname !== "/" && (
            <button
              className="h-fit rounded bg-transparent"
              onClick={() => router.back()}
            >{`⬅️ Back`}</button>
          )}

          {isSignedIn && <SignOutButton />}
        </nav>
        <article>{props.children}</article>
      </article>
    </main>
  );
};

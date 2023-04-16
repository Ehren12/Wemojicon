import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  const router = useRouter();
  return (
    <main className="flex h-screen justify-center">
      <article className="flex h-full w-full flex-col overflow-auto border-x border-slate-400 scrollbar-thin scrollbar-track-black scrollbar-thumb-gray-600 scrollbar-thumb-rounded-full md:max-w-2xl">
        <div>
          {" "}
          {router.pathname !== "/" && (
            <button className="p-4 h-fit rounded bg-transparent" onClick={() => router.back()}>{`⬅️ Back`}</button>
          )}
        </div>
        <article>{props.children}</article>
      </article>
    </main>
  );
};

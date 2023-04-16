import { SignOutButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";
import Image from "next/image";

import { MoonStars } from "@phosphor-icons/react";
import NavBar from "./navBar";

export const PageLayout = (props: PropsWithChildren) => {
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  return (
    <main className="flex h-screen justify-center">
      <article className="flex h-full w-full flex-col overflow-auto border-x border-[#0E1C36]/20 scrollbar-thin scrollbar-track-[#f5f5f5] scrollbar-thumb-[#0E1C36]/25 md:max-w-2xl">
        {/* <nav className="flex flex-row justify-between bg-white p-4">
          <div>
            {" "}
            {router.pathname !== "/" && (
              <button
                className="h-fit rounded bg-transparent"
                onClick={() => router.back()}
              >{`⬅️ Back`}</button>
            )}
          </div>
          <div className="flex flex-row gap-4 items-center">
            <MoonStars size={32} weight="duotone" className="text-[#5D675B]"/>
            {isSignedIn && (
              <Image
                src={user.profileImageUrl}
                alt="Profile Image"
                className="h-14 w-14 rounded-[20px]"
                width={1080}
                height={1080}
                priority
              />
            )}
          </div>
        </nav> */}
        <NavBar />
        <article>{props.children}</article>
      </article>
    </main>
  );
};

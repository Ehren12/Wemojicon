import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="w-full h-full border-x border-slate-400 md:max-w-2xl overflow-auto">
        {props.children}
      </div>
    </main>
  );
};

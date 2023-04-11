import { type NextPage } from "next";
import Head from "next/head";

const PostPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Express yourself with just emojis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="">
          Post View
        </div>
      </main>
    </>
  );
};

export default PostPage;

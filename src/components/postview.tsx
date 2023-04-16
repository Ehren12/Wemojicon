import { type RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"]["result"][number];

export const PostView = (props: PostWithUser) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    void router.push(`/posts/${props.post.id}`);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      key={props.post.id}
      className="flex cursor-pointer gap-3 border-b border-slate-400 px-4 hover:bg-gray-900"
      onClick={handleClick}
    >
      <div className="flex h-full flex-col py-4">
        <Link href={`/@${props.author.username}`} passHref onClick={handleImageClick}>
          <Image
            src={props.author.profilePicture}
            alt={`@${props.author.username}'s profile picture`}
            className="h-14 w-14 rounded-full"
            width={56}
            height={56}
            priority
          />
        </Link>
      </div>
      <div
        className="flex h-full grow cursor-pointer flex-col"
        onClick={handleClick}
      >
        <div className="h-full py-4">
          <div className="flex gap-1 text-slate-300">
            <Link href={`/@${props.author.username}`} onClick={handleImageClick}>
              <span>{`@${props.author.username}`}</span>
            </Link>
            <Link href={`/posts/${props.post.id}`}>
              <span className="font-thin">{` · ${dayjs(
                props.post.createdAt
              ).fromNow()}`}</span>
            </Link>
          </div>
          <span className="text-2xl">{props.post.content}</span>
        </div>
      </div>
    </div>
  );
};

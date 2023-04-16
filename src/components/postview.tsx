import { type RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
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
      className="flex cursor-pointer gap-3 border-b border-[#0E1C36]/20 px-4 hover:bg-[#f5f5f5]/30"
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
        <div className="flex flex-col gap-2 h-full py-4">
          <div className="flex gap-1">
            <Link href={`/@${props.author.username}`} onClick={handleImageClick} className="flex gap-1">
              {props.author.firstName && (<span className="font-bold w-fit text-[#0E1C36]/60">{props.author.firstName}</span>)}
              <span className="text-[#0E1C36]/40">{`@${props.author.username}`}</span>
            </Link>
            <Link href={`/posts/${props.post.id}`}>
              <span className="font-thin text-[#0E1C36]/50">{` · ${dayjs(
                props.post.createdAt
              ).fromNow()}`}</span>
            </Link>
          </div>
          <span className="text-3xl">{props.post.content}</span>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";

export function useEmoji() {
  const [emoji, setEmoji] = useState("");
  useEffect(() => {
    const randomEmojiList = ["❤️", "😈", "😁", "🤪", "🐽", "🙂", "🫠"];
    const randomEmojiIndex = Math.floor(Math.random() * randomEmojiList.length);
    const randomEmoji = randomEmojiList[randomEmojiIndex] as string;
    setEmoji(randomEmoji);
  }, []);
  return { emoji };
}
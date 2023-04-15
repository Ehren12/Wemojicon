import {type  SyntheticEvent, useEffect, useState } from "react";

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

export function onPromise<T>(promise: (event: SyntheticEvent) => Promise<T>) {
  return (event: SyntheticEvent) => {
    if (promise) {
      promise(event).catch((error) => {
        console.log("Unexpected error", error);
      });
    }
  };
}
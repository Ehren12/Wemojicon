import { type SyntheticEvent, useEffect, useState, useMemo, useCallback } from "react";

export function useEmoji() {
  const [emoji, setEmoji] = useState("");
  const [multipleRandom, setMultipleRandom] = useState<string[]>([]);
  const randomEmojiList = useMemo(() => {
    return ["❤️", "😈", "😁", "🤪", "🐽", "🙂", "🫠"];
  }, []);
  useEffect(() => {
    const randomEmojiIndex = Math.floor(Math.random() * randomEmojiList.length);
    const randomEmoji = randomEmojiList[randomEmojiIndex] as string;
    setEmoji(randomEmoji);
  }, [randomEmojiList]);
  useEffect(() => {
    const getMultipleRandom = (num: number) => {
      const shuffled = [...randomEmojiList].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    };

    setMultipleRandom(getMultipleRandom(4))
  }, [randomEmojiList])
  return { emoji, multipleRandom };
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

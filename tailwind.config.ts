import { type Config } from "tailwindcss";
import tailwindScrollbar from "tailwind-scrollbar";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [tailwindScrollbar({ nocompatible: true })],
} satisfies Config;

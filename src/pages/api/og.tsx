import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default function () {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          color: "white"
        }}
      >
        Wemojicon ⚡
      </div>
    ),
    {
      width: 1200,
      height: 600,
    }
  );
}

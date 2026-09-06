import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(180deg, #2e026d 0%, #15162c 100%)",
          borderRadius: 40,
          color: "#d8b4fe",
          display: "flex",
          fontSize: 96,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        H
      </div>
    ),
    size,
  );
}

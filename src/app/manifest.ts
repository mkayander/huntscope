import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Huntscope",
    short_name: "Huntscope",
    description:
      "Analytics dashboard for your job-search data repository on disk or GitHub.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    background_color: "#15162c",
    theme_color: "#2e026d",
    orientation: "any",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    file_handlers: [
      {
        action: "/",
        accept: {
          "text/markdown": [".md", ".markdown"],
          "text/plain": [".md", ".txt"],
        },
      },
    ],
    launch_handler: {
      client_mode: ["navigate-existing", "auto"],
    },
  };
}

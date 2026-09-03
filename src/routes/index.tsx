import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeadFinder AI" },
      {
        name: "description",
        content:
          "Encontre leads e descubra o melhor momento para entrar em contato com cada um.",
      },
      { property: "og:title", content: "LeadFinder AI" },
      {
        property: "og:description",
        content: "Encontre leads e descubra o melhor momento para entrar em contato com cada um.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

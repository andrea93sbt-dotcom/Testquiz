import { createFileRoute } from "@tanstack/react-router";
import { MustConsent } from "@/components/quiz/must-consent";
import { TagPage } from "@/components/quiz/tag-page";

export const Route = createFileRoute("/tag/$tag")({
  component: TagRoute,
  head: ({ params }) => ({
    meta: [{ title: `${decodeURIComponent(params.tag)} · Platea` }],
  }),
});

function TagRoute() {
  const { tag } = Route.useParams();
  return (
    <MustConsent>
      <TagPage tag={tag} />
    </MustConsent>
  );
}

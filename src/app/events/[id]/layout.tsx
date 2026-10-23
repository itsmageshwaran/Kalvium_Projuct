import { Metadata, ResolvingMetadata } from "next";
import { adminDb } from "@/lib/firebase/admin";

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;

  try {
    const doc = await adminDb.collection("events").doc(id).get();
    if (doc.exists) {
      const event = doc.data();
      const title = `${event?.title} | CampusHub`;
      const description = event?.summary || "View this verified event on CampusHub.";
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: event?.posterUrl ? [event.posterUrl] : [],
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: event?.posterUrl ? [event.posterUrl] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata for event:", error);
  }

  return {
    title: "Event Details | CampusHub",
    description: "View verified campus event details.",
  };
}

export default function EventDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

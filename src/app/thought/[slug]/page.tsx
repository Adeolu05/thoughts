import type { Metadata } from "next";
import { ThoughtDetail } from "@/components/thought-detail";

export const metadata: Metadata = {
  title: "Thought",
};

export default async function ThoughtPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ThoughtDetail slug={slug} />;
}

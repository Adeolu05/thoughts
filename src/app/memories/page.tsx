import type { Metadata } from "next";
import { MemoriesView } from "@/components/memories-view";

export const metadata: Metadata = {
  title: "Memories",
  description: "On this day, emotion trends, and your full archive.",
};

export default function MemoriesPage() {
  return <MemoriesView />;
}

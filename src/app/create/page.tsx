import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateEditor } from "@/components/create-editor";

export const metadata: Metadata = {
  title: "Write",
  description: "Capture a thought and turn it into a beautiful visual card.",
};

function EditorFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-[#1c1930]" />
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<EditorFallback />}>
      <CreateEditor />
    </Suspense>
  );
}

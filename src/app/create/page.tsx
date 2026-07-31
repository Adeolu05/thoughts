import type { Metadata } from "next";
import { CreateEditor } from "@/components/create-editor";

export const metadata: Metadata = {
  title: "Write",
  description: "Capture a thought and turn it into a beautiful visual card.",
};

export default function CreatePage() {
  return <CreateEditor />;
}

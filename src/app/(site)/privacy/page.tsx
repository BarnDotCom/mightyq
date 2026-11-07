import type { Metadata } from "next";
import { LegalPageView } from "@/components/LegalPageView";

export const revalidate = 60;
export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return <LegalPageView slug="privacy" />;
}

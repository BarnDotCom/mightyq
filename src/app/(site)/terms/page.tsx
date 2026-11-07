import type { Metadata } from "next";
import { LegalPageView } from "@/components/LegalPageView";

export const revalidate = 60;
export const metadata: Metadata = { title: "Submission terms" };

export default function TermsPage() {
  return <LegalPageView slug="terms" />;
}


import HeroSection from "@/app/components/layout/heroSection";
import TrandingSection from "@/app/components/layout/trandingSection";
import { getTranslations } from "next-intl/server";

export default async function Library() {
  const t = await getTranslations('Library');
  return (
    <div>
      <HeroSection />
      <TrandingSection />
    </div>
  );
}

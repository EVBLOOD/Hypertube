
import HeroSection from "@/app/components/layout/heroSection";
import { getTranslations } from "next-intl/server";

export default async function Library() {
  const t = await getTranslations('Library');
  return (
    <div>
      <HeroSection />
      Hello World this is {t('name')}
    </div>
  );
}

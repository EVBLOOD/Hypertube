import { redirect } from "next/navigation";
import HeroSection from "../components/layout/heroSection";
import TrandingSection from "../components/layout/trandingSection";

export default function Home() {
  return (
  <div>
    <HeroSection />
    <TrandingSection />
  </div>)
}

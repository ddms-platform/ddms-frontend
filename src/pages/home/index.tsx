import HeroSection from './components/hero-section';
import CategoryPills from './components/category-pills';
import FeaturedTours from './components/featured-tours';
import HowItWorks from './components/how-it-works';
import Destinations from './components/destinations';
import CtaSection from './components/cta-section';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryPills />
      <FeaturedTours />
      <HowItWorks />
      <Destinations />
      <CtaSection />
    </>
  );
}

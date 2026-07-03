import HeroSection from './components/hero-section';
import CategoryPills from './components/category-pills';
import BookingPromo from './components/booking-promo';
import FeaturedTours from './components/featured-tours';
import FeaturedProviders from './components/featured-providers';
import ExploreDaNang from './components/explore-danang';
import CtaSection from './components/cta-section';
import FooterSearchTrigger from './components/footer-search-trigger';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryPills />
      <BookingPromo />
      <FeaturedTours />
      <FeaturedProviders />
      <ExploreDaNang />
      <CtaSection />
      <FooterSearchTrigger />
    </>
  );
}

import { useEffect } from 'react';
import HeroSection from './components/hero';
import ExperienceVideo from './components/experience-video';
import BookingPromo from './components/booking-promo';
import FeaturedTours from './components/featured-tours';
import FeaturedProviders from './components/featured-providers';
import ExploreDaNang from './components/explore-danang';
import CtaSection from './components/cta-section';
import FooterSearchTrigger from './components/footer-search-trigger';
import {
  resumeBackgroundAudio,
  pauseBackgroundAudio,
} from '@/lib/audio-manager';

export default function HomePage() {
  useEffect(() => {
    resumeBackgroundAudio();
    return () => {
      pauseBackgroundAudio();
    };
  }, []);

  return (
    <>
      <HeroSection />
      <ExperienceVideo />
      <BookingPromo />
      <FeaturedTours />
      <FeaturedProviders />
      <ExploreDaNang />
      <CtaSection />
      <FooterSearchTrigger />
    </>
  );
}

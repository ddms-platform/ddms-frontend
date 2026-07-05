import { useTranslation } from 'react-i18next';
import ImageCarousel from '@/components/shared/image-carousel';

interface TourGalleryProps {
  images: string[];
  title: string;
  className?: string;
  aspectRatio?: string;
}

export default function TourGallery({
  images,
  title,
  className,
  aspectRatio,
}: TourGalleryProps) {
  const { t } = useTranslation();

  return (
    <ImageCarousel
      images={images}
      getAltText={(i) => `${title} - ${t('tour.gallery.photo')} ${i + 1}`}
      className={className}
      aspectRatio={aspectRatio}
    />
  );
}

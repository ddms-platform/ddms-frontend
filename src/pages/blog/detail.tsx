import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, ExternalLink, Eye, Sparkles } from 'lucide-react';
import {
  blogService,
  BLOG_CATEGORIES,
  type BlogPostDetail,
} from '@/services/blogService';
import ArticleVideoPlayer from './components/ArticleVideoPlayer';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&auto=format&fit=crop&q=80';

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(value))
    : '';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await blogService.getBySlug(slug);
        if (active) setPost(res);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-6 aspect-video animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-base text-muted-foreground">
          Không tìm thấy bài viết này.
        </p>
        <Link
          to="/tin-tuc"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ddms-secondary"
        >
          <ArrowLeft size={16} /> Về trang tin tức
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <Link
        to="/tin-tuc"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} /> Tin tức
      </Link>

      <span className="inline-block rounded-full bg-ddms-secondary/12 px-3 py-1 text-xs font-semibold text-ddms-secondary">
        {BLOG_CATEGORIES[post.category] ?? post.category}
      </span>

      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} /> {formatDate(post.publishedAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye size={14} /> {post.viewCount} lượt xem
        </span>
      </div>

      {/* Nói rõ đây là nội dung do AI biên tập lại, không phải bài gốc. */}
      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-ddms-secondary/30 bg-ddms-secondary/5 p-4">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-ddms-secondary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Nội dung được DDMS biên tập lại bằng AI từ bản tin của{' '}
          <strong className="text-foreground">
            {post.sourceName ?? 'báo chí'}
          </strong>
          . Vui lòng đọc bài gốc để có thông tin đầy đủ và chính xác nhất.
        </p>
      </div>

      {post.videoScenes.length > 0 && (
        <div className="mt-8">
          <ArticleVideoPlayer
            scenes={post.videoScenes}
            fallbackImage={post.coverImageUrl || FALLBACK_COVER}
            title={post.title}
          />
        </div>
      )}

      {post.summary && (
        <p className="mt-8 text-lg font-medium leading-relaxed text-foreground">
          {post.summary}
        </p>
      )}

      {post.content && (
        <div className="mt-6 space-y-4">
          {post.content
            .split('\n\n')
            .map((para) => para.trim())
            .filter(Boolean)
            .map((para, i) => (
              <p
                key={i}
                className="text-base leading-relaxed text-foreground/90"
              >
                {para.replace(/^#+\s*/, '')}
              </p>
            ))}
        </div>
      )}

      {post.sourceUrl && (
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-10 flex items-center justify-between gap-4 rounded-xl border border-border bg-ddms-bg-card p-4 transition-colors hover:border-ddms-secondary/50"
        >
          <span className="text-sm text-muted-foreground">
            Theo{' '}
            <strong className="text-foreground">
              {post.sourceName ?? 'nguồn gốc'}
            </strong>
            {post.sourcePublishedAt &&
              ` · ${formatDate(post.sourcePublishedAt)}`}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ddms-secondary">
            Đọc bài gốc <ExternalLink size={14} />
          </span>
        </a>
      )}
    </article>
  );
}

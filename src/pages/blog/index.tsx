import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Newspaper, PlayCircle } from 'lucide-react';
import {
  blogService,
  BLOG_CATEGORIES,
  type BlogPostListItem,
} from '@/services/blogService';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&auto=format&fit=crop&q=80';

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(value))
    : '';

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [category, setCategory] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await blogService.getPosts({
          category,
          page: 1,
          pageSize: 24,
        });
        if (active) setPosts(res.items ?? []);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
        if (active) setPosts([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [category]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Cẩm nang &amp; Tin tức Đường thủy
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Tin du lịch Đà Nẵng được tổng hợp từ báo chí và biên tập lại. Mỗi bài
          đều dẫn về nguồn gốc để bạn đọc bản đầy đủ.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <CategoryChip
          label="Tất cả"
          active={!category}
          onClick={() => setCategory(undefined)}
        />
        {Object.entries(BLOG_CATEGORIES).map(([key, label]) => (
          <CategoryChip
            key={key}
            label={label}
            active={category === key}
            onClick={() => setCategory(key)}
          />
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl border border-border bg-ddms-bg-card"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <Newspaper size={28} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Chưa có bài viết nào được xuất bản.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/tin-tuc/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-ddms-bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-muted">
                <img
                  src={post.coverImageUrl || FALLBACK_COVER}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-rausch px-3 py-1 text-[11px] font-bold text-white">
                  {BLOG_CATEGORIES[post.category] ?? post.category}
                </span>
                {post.hasVideo && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <PlayCircle size={13} /> Video
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-bold leading-snug text-foreground">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {post.summary}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {formatDate(post.publishedAt)}
                  </span>
                  {post.sourceName && (
                    <span className="truncate">Theo {post.sourceName}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-ddms-secondary bg-ddms-secondary/10 text-ddms-secondary'
          : 'border-border text-muted-foreground hover:border-ddms-secondary/40 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

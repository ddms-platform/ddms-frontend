import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center gap-8 px-4 py-16 md:py-24">
        <div className="relative h-44 w-44">
          <img
            src={heroImg}
            width="170"
            height="179"
            alt="Hero"
            className="absolute inset-0 h-full w-full object-contain"
          />
          <img
            src={reactLogo}
            alt="React logo"
            className="absolute inset-0 size-full animate-spin object-contain duration-20"
          />
          <img
            src={viteLogo}
            alt="Vite logo"
            className="absolute inset-0 size-full animate-bounce object-contain"
          />
        </div>

        {/* Content */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold text-primary md:text-5xl">Get started</h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Edit{' '}
            <code className="rounded bg-muted px-2 py-1 text-sm text-foreground">src/App.tsx</code>{' '}
            and save to test{' '}
            <code className="rounded bg-muted px-2 py-1 text-sm text-foreground">HMR</code>
          </p>
        </div>

        {/* Counter Button */}
        <button
          onClick={() => setCount((count) => count + 1)}
          className="rounded-lg border border-border bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
        >
          Count is {count}
        </button>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Next Steps Section */}
      <section className="grid gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        {/* Documentation */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <svg className="size-6 text-primary" role="presentation" aria-hidden="true">
              <use href="/icons.svg#documentation-icon" />
            </svg>
            <h2 className="text-2xl font-semibold text-primary md:text-3xl">Documentation</h2>
          </div>
          <p className="text-muted-foreground">Your questions, answered</p>
          <ul className="space-y-3">
            <li>
              <a
                href="https://vite.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <img src={viteLogo} alt="Vite logo" className="size-5" />
                <span>Explore Vite</span>
              </a>
            </li>
            <li>
              <a
                href="https://react.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <img src={reactLogo} alt="React logo" className="size-5" />
                <span>Learn more</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <svg className="size-6 text-primary" role="presentation" aria-hidden="true">
              <use href="/icons.svg#social-icon" />
            </svg>
            <h2 className="text-2xl font-semibold text-primary md:text-3xl">Connect with us</h2>
          </div>
          <p className="text-muted-foreground">Join the Vite community</p>
          <ul className="space-y-3">
            <li>
              <a
                href="https://github.com/vitejs/vite"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <svg className="size-5" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon" />
                </svg>
                <span>GitHub</span>
              </a>
            </li>
            <li>
              <a
                href="https://chat.vite.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <svg className="size-5" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon" />
                </svg>
                <span>Discord</span>
              </a>
            </li>
            <li>
              <a
                href="https://x.com/vite_js"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <svg className="size-5" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#x-icon" />
                </svg>
                <span>X.com</span>
              </a>
            </li>
            <li>
              <a
                href="https://bsky.app/profile/vite.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <svg className="size-5" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#bluesky-icon" />
                </svg>
                <span>Bluesky</span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Bottom Divider */}
      <div className="border-t border-border" />
    </div>
  );
}

export default App;

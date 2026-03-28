import Link from 'next/link';
import { PRICING_PLANS } from '@/lib/payments/stripe-stub';
import clsx from 'clsx';

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section
        className="rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary px-6 py-16 text-center text-white shadow-lg sm:px-12 sm:py-20"
        data-testid="hero"
      >
        <h2 className="text-3xl font-bold sm:text-4xl">
          Your child&apos;s own personalized book series
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm opacity-90 sm:text-base">
          AI-generated, character-consistent, illustrated micro-books where YOUR
          child is the main character. Digital reader + printed books delivered
          to your door.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/create"
            className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-brand-primary no-underline shadow-sm transition-colors hover:bg-white/90"
          >
            Create a Book
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-white/40 px-8 py-3 text-sm font-medium text-white no-underline transition-colors hover:bg-white/10"
          >
            Sign Up Free
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section data-testid="how-it-works">
        <h3 className="mb-8 text-center text-xl font-bold text-slate-800">How It Works</h3>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { step: '1', title: 'Create a Profile', desc: 'Upload photos, set name, age, and outfit. Your child becomes the character.' },
            { step: '2', title: 'Pick a Story', desc: 'Choose from real-life first experiences: kindergarten, dentist, bike riding, and more.' },
            { step: '3', title: 'Read or Print', desc: 'Enjoy the interactive digital reader or order a beautiful printed book.' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 text-center shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-lg font-bold text-white">
                {item.step}
              </span>
              <h4 className="font-semibold text-slate-800">{item.title}</h4>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Spread */}
      <section data-testid="sample-spread">
        <h3 className="mb-8 text-center text-xl font-bold text-slate-800">Sample Book Spread</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/20 text-4xl text-slate-300"
            >
              {n}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section data-testid="pricing">
        <h3 className="mb-8 text-center text-xl font-bold text-slate-800">Simple Pricing</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={clsx(
                'flex flex-col rounded-xl border-2 p-6',
                plan.highlighted
                  ? 'border-brand-primary bg-brand-primary/5 shadow-md'
                  : 'border-slate-200 bg-white',
              )}
              data-testid={`plan-${plan.tier}`}
            >
              {plan.highlighted && (
                <span className="mb-2 self-start rounded-full bg-brand-primary px-3 py-0.5 text-xs font-medium text-white">
                  Popular
                </span>
              )}
              <h4 className="text-lg font-bold text-slate-800">{plan.name}</h4>
              <p className="mt-1 text-2xl font-bold text-brand-primary">{plan.price}</p>
              <ul className="mt-4 flex flex-1 flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-0.5 text-green-500">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={clsx(
                  'mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-medium no-underline transition-colors',
                  plan.highlighted
                    ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                )}
              >
                {plan.tier === 'free' ? 'Get Started' : 'Subscribe'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section data-testid="faq">
        <h3 className="mb-8 text-center text-xl font-bold text-slate-800">FAQ</h3>
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {[
            { q: 'What age range are the books for?', a: 'Our stories are designed for children aged 2-6, with vocabulary adjusted for toddlers, preschoolers, and early readers.' },
            { q: 'How does character consistency work?', a: 'Upload 2-3 photos and we generate a watercolor character sheet. Your child looks the same across every page and every book.' },
            { q: 'Can I get a printed book?', a: 'Yes! We offer print-on-demand in 10x10cm and 15x15cm formats, delivered within 3-5 business days in Germany.' },
            { q: 'Are the stories bilingual?', a: 'Every story can be generated in English, German, or both. Toggle between languages in the reader.' },
          ].map((item) => (
            <div key={item.q} className="rounded-xl bg-white p-5 shadow-sm">
              <h4 className="font-semibold text-slate-800">{item.q}</h4>
              <p className="mt-2 text-sm text-slate-500">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-8 text-center text-xs text-slate-400" data-testid="footer">
        <p>&copy; 2026 bedtime-ahana. All stories are original works. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/login" className="hover:text-slate-600">Sign In</Link>
          <Link href="/register" className="hover:text-slate-600">Register</Link>
          <Link href="/create" className="hover:text-slate-600">Create a Book</Link>
        </div>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { PRICING_PLANS } from '@/lib/payments/stripe-stub';
import clsx from 'clsx';

const SAMPLE_PAGES = [
  {
    title: 'Page 3',
    text: 'Emma looked up at the big doors of the kindergarten. Her heart beat fast, but Mama squeezed her hand.',
    gradient: 'from-amber-100 to-rose-100',
    accent: 'text-amber-700',
  },
  {
    title: 'Page 8',
    text: 'Inside, there were tiny chairs and bright paintings on the walls. A girl with red boots waved at Emma.',
    gradient: 'from-sky-100 to-indigo-100',
    accent: 'text-indigo-700',
  },
  {
    title: 'Page 18',
    text: '"I made a friend today!" Emma told Papa at dinner. She couldn\'t wait to go back tomorrow.',
    gradient: 'from-emerald-100 to-teal-100',
    accent: 'text-emerald-700',
  },
];

const TESTIMONIALS = [
  {
    quote: 'My daughter asks for "her book" every single night. She loves seeing herself as the hero.',
    author: 'Sarah M.',
    detail: 'Mother of Lina, age 4',
  },
  {
    quote: 'The illustrations are beautiful and the stories actually teach real-life lessons. Worth every cent.',
    author: 'Thomas K.',
    detail: 'Father of Max, age 3',
  },
  {
    quote: 'We ordered a printed copy for grandparents. They cried. Best gift we ever gave.',
    author: 'Anna L.',
    detail: 'Mother of Sophie, age 5',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-24">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-3xl bg-brand-primary px-6 py-16 text-center text-white shadow-xl sm:px-12 sm:py-24"
        data-testid="hero"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary to-brand-accent/30 opacity-90" />
        <div className="relative z-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-accent">
            Personalized Children&apos;s Books
          </p>
          <h2 className="font-serif text-3xl font-bold leading-tight sm:text-5xl sm:leading-tight">
            Every night, a new adventure
            <br className="hidden sm:block" />
            <span className="text-brand-secondary"> starring your child</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            Beautifully illustrated storybooks where your child is the hero.
            Personalized, printed, and made to be treasured.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/create"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-brand-primary no-underline shadow-lg transition-all hover:bg-warm-100 hover:shadow-xl"
            >
              Create Your Child&apos;s Story
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-white/30 px-8 py-3.5 text-sm font-medium text-white no-underline transition-all hover:border-white/60 hover:bg-white/10"
            >
              Start Free
            </Link>
          </div>
          <p className="mt-5 text-xs text-white/50">
            No credit card required. Your first story is free.
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="flex flex-wrap items-center justify-center gap-6 text-center text-sm text-warm-500 sm:gap-10">
        <span className="flex items-center gap-1.5">
          <span className="text-brand-accent">&#9733;</span>
          Loved by 1,200+ families
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-brand-accent">&#9733;</span>
          Stories in English &amp; German
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-brand-accent">&#9733;</span>
          Keepsake-quality prints
        </span>
      </section>

      {/* How It Works */}
      <section data-testid="how-it-works">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-brand-accent">How It Works</p>
        <h3 className="mt-2 text-center font-serif text-2xl font-bold text-warm-800 sm:text-3xl">
          Three steps to a story they&apos;ll never forget
        </h3>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Tell us about your child',
              desc: 'Name, age, appearance, favorite things. Your child becomes the main character of every story.',
            },
            {
              step: '2',
              title: 'Choose an adventure',
              desc: 'First day at kindergarten, a trip to the dentist, learning to ride a bike \u2014 real-life moments made magical.',
            },
            {
              step: '3',
              title: 'Read, share, or print',
              desc: 'Enjoy the interactive reader together, or order a beautiful keepsake book delivered to your door.',
            },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-warm-200/60">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary font-serif text-lg font-bold text-white">
                {item.step}
              </span>
              <h4 className="font-serif text-lg font-semibold text-warm-800">{item.title}</h4>
              <p className="text-sm leading-relaxed text-warm-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Spread */}
      <section data-testid="sample-spread">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-brand-accent">See the Quality</p>
        <h3 className="mt-2 text-center font-serif text-2xl font-bold text-warm-800 sm:text-3xl">
          A glimpse inside Emma&apos;s first day
        </h3>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-warm-500">
          Every story is 24 pages of original illustrations and age-appropriate text, personalized with your child&apos;s name, family, and world.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {SAMPLE_PAGES.map((page) => (
            <div
              key={page.title}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-warm-200/60 transition-all hover:shadow-md"
            >
              <div className={`flex aspect-square items-center justify-center bg-gradient-to-br ${page.gradient} p-6`}>
                <span className={`font-serif text-5xl font-bold ${page.accent} opacity-20`}>
                  {page.title.split(' ')[1]}
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-warm-400">{page.title}</p>
                <p className="mt-2 font-serif text-sm leading-relaxed text-warm-700">
                  &ldquo;{page.text}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section
        className="rounded-3xl bg-brand-primary/[0.03] px-6 py-14 sm:px-10"
        data-testid="testimonials"
      >
        <p className="text-center text-sm font-medium uppercase tracking-widest text-brand-accent">From Our Families</p>
        <h3 className="mt-2 text-center font-serif text-2xl font-bold text-warm-800 sm:text-3xl">
          Parents love what we create together
        </h3>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-warm-200/60"
            >
              <p className="font-serif text-sm italic leading-relaxed text-warm-700">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 border-t border-warm-100 pt-4">
                <p className="text-sm font-semibold text-warm-800">{t.author}</p>
                <p className="text-xs text-warm-400">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section data-testid="pricing">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-brand-accent">Pricing</p>
        <h3 className="mt-2 text-center font-serif text-2xl font-bold text-warm-800 sm:text-3xl">
          Start free. Upgrade when you&apos;re ready.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-warm-500">
          Every plan includes our interactive reader, bilingual support, and beautifully illustrated stories.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={clsx(
                'flex flex-col rounded-2xl border-2 p-6 transition-shadow hover:shadow-md',
                plan.highlighted
                  ? 'border-brand-primary bg-brand-primary/[0.03] shadow-md'
                  : 'border-warm-200 bg-white',
              )}
              data-testid={`plan-${plan.tier}`}
            >
              {plan.highlighted && (
                <span className="mb-3 self-start rounded-full bg-brand-accent px-3 py-0.5 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h4 className="font-serif text-lg font-bold text-warm-800">{plan.name}</h4>
              <p className="mt-1 text-2xl font-bold text-brand-primary">{plan.price}</p>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-warm-600">
                    <span className="mt-0.5 text-brand-accent">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={clsx(
                  'mt-6 block rounded-full px-4 py-2.5 text-center text-sm font-medium no-underline transition-all',
                  plan.highlighted
                    ? 'bg-brand-primary text-white hover:bg-brand-primary/90 hover:shadow-md'
                    : 'bg-warm-100 text-warm-700 hover:bg-warm-200',
                )}
              >
                {plan.tier === 'free' ? 'Start Free' : 'Choose Plan'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section data-testid="faq">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-brand-accent">Questions</p>
        <h3 className="mt-2 text-center font-serif text-2xl font-bold text-warm-800 sm:text-3xl">
          Everything you need to know
        </h3>
        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-4">
          {[
            { q: 'What age range are the books for?', a: 'Our stories are designed for children aged 2\u20136, with vocabulary carefully adjusted for toddlers, preschoolers, and early readers.' },
            { q: 'How does character consistency work?', a: 'We generate a detailed character sheet from your child\u2019s profile. Your child looks the same across every page and every book \u2014 always recognizable, always the hero.' },
            { q: 'Can I order a printed book?', a: 'Yes! We offer keepsake-quality printed books in 10\u00d710cm and 15\u00d715cm formats, delivered within 3\u20135 business days in Germany.' },
            { q: 'Are the stories bilingual?', a: 'Every story can be generated in English, German, or both. Toggle between languages in the reader with one tap.' },
            { q: 'Is my child\u2019s data safe?', a: 'Absolutely. We never share your data with third parties. All personal information is stored securely and used only to create your stories.' },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-warm-200/60">
              <h4 className="font-serif font-semibold text-warm-800">{item.q}</h4>
              <p className="mt-2 text-sm leading-relaxed text-warm-500">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-3xl bg-brand-primary px-6 py-14 text-center text-white sm:px-12 sm:py-16">
        <h3 className="font-serif text-2xl font-bold sm:text-3xl">
          Ready to create something magical?
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
          Your child&apos;s first personalized story is free. No credit card, no commitment.
        </p>
        <Link
          href="/create"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-brand-primary no-underline shadow-lg transition-all hover:bg-warm-100 hover:shadow-xl"
        >
          Create Your Child&apos;s Story
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-warm-200 pt-8 text-center text-xs text-warm-400" data-testid="footer">
        <p>&copy; 2026 Ahana. All stories are original works. All rights reserved.</p>
        <div className="mt-3 flex justify-center gap-5">
          <Link href="/login" className="text-warm-400 no-underline hover:text-warm-600">Sign In</Link>
          <Link href="/register" className="text-warm-400 no-underline hover:text-warm-600">Register</Link>
          <Link href="/create" className="text-warm-400 no-underline hover:text-warm-600">Create a Story</Link>
        </div>
      </footer>
    </div>
  );
}

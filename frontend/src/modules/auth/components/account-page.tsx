import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { SectionHeading } from "@/shared/ui/section-heading";

import { getMe } from "../api/me.service";
import { accountCards, accountShortcuts, accountWelcomeImage, type AccountCardId } from "../content";
import type { Me } from "../types";
import { SignOutButton } from "./sign-out-button";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const fullDateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

// ---- Welcome band: image and greeting split 50/50 from tablet up (like the
// homepage editorial story), stacked on phones.

function WelcomeBand({ me }: { me: Me }) {
  return (
    <section aria-labelledby="account-title" className="grid bg-surface md:grid-cols-2">
      <div className="media-frame aspect-[4/3] md:aspect-auto md:min-h-[28rem] lg:min-h-[34rem]">
        <Image
          src={accountWelcomeImage.src}
          alt={accountWelcomeImage.alt}
          fill
          loading="eager"
          sizes="(min-width: 768px) 50vw, 100vw"
          style={{ objectPosition: accountWelcomeImage.position }}
        />
      </div>

      <div className="flex items-center px-gutter py-section-sm md:px-10 lg:px-16 xl:px-24">
        <div className="max-w-md">
          <p className="type-label text-ink-muted">My account</p>
          <h1 id="account-title" className="mt-4 type-display break-words">
            Hello, {me.name.split(" ")[0]}
          </h1>
          <p className="mt-6 type-body-lg text-ink-muted">
            Welcome back. Member since {dateFormat.format(new Date(me.createdAt))}.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {me.role === "admin" ? (
              <Link href="/admin" className="btn btn-primary">
                Admin tools
              </Link>
            ) : (
              <Link href="/collections/new-in" className="btn btn-primary">
                Shop new arrivals
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Information cards: an image above each group of details, on the same
// image-then-label rhythm as the homepage category tiles.

function InfoCard({ id, children }: { id: AccountCardId; children: ReactNode }) {
  const card = accountCards[id];
  return (
    <li className="flex flex-col">
      <div className="media-frame aspect-[4/3]">
        <Image
          src={card.image.src}
          alt={card.image.alt}
          fill
          sizes="(min-width: 1440px) 30rem, (min-width: 768px) 33vw, 100vw"
          style={{ objectPosition: card.image.position }}
        />
      </div>
      <div className="flex flex-1 flex-col bg-surface px-6 py-7 md:px-5 lg:px-8 lg:py-8">
        <p className="type-label text-ink-muted">{card.eyebrow}</p>
        <h3 className="mt-3 type-title">{card.title}</h3>
        <dl className="mt-6 flex flex-col gap-5 border-t pt-6">{children}</dl>
      </div>
    </li>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="type-label text-ink-muted">{label}</dt>
      <dd className="mt-2 type-body break-words">{children}</dd>
    </div>
  );
}

function InformationSection({ me }: { me: Me }) {
  return (
    <section aria-labelledby="information-title" className="container-page py-section">
      <SectionHeading id="information-title" eyebrow="Your details" title="Account information" />

      <ul className="mt-8 grid gap-x-2 gap-y-8 md:grid-cols-3 lg:mt-10">
        <InfoCard id="profile">
          <Detail label="Name">{me.name}</Detail>
          <Detail label="Email">{me.email}</Detail>
        </InfoCard>

        <InfoCard id="membership">
          <Detail label="Member since">{fullDateFormat.format(new Date(me.createdAt))}</Detail>
          <Detail label="Account type">
            {me.role === "admin" ? "Administrator" : "Customer"}
          </Detail>
        </InfoCard>

        <InfoCard id="security">
          <Detail label="Sign-in method">Email and password</Detail>
          <Detail label="Email status">
            {me.emailVerified ? (
              <span className="text-success">Verified</span>
            ) : (
              <span className="text-ink-muted">Not yet verified</span>
            )}
          </Detail>
        </InfoCard>
      </ul>
    </section>
  );
}

// ---- Shortcuts: full-bleed image pair with a bottom scrim, like the
// homepage featured collections.

function ShortcutsSection() {
  return (
    <section aria-labelledby="shortcuts-title" className="pb-section">
      <div className="container-page">
        <SectionHeading id="shortcuts-title" eyebrow="For you" title="Continue shopping" />
      </div>

      <ul className="mt-8 grid gap-0.5 md:grid-cols-2 lg:mt-10">
        {accountShortcuts.map((shortcut) => (
          <li key={shortcut.href}>
            <Link
              href={shortcut.href}
              className="group media-frame block aspect-portrait text-canvas md:aspect-[4/3] lg:aspect-landscape"
            >
              <Image
                src={shortcut.image.src}
                alt={shortcut.image.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                style={{ objectPosition: shortcut.image.position }}
                className="transition-transform duration-1000 ease-standard group-hover:scale-[1.02]"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center bg-linear-to-t from-ink/65 via-ink/25 to-transparent px-gutter pt-32 pb-10 text-center lg:pb-12">
                <p className="type-label">{shortcut.eyebrow}</p>
                <h3 className="mt-3 type-heading">{shortcut.title}</h3>
                <p className="mt-3 max-w-xs type-body">{shortcut.description}</p>
                <span className="mt-6 type-label underline decoration-1 underline-offset-[0.5em]">
                  Shop now
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---- Page

async function AccountContent() {
  const me = await getMe();
  // proxy.ts refreshes the access token before this renders; a null here
  // means the session itself is gone (revoked or the account was deleted).
  if (!me) redirect("/sign-in?next=/account");

  return (
    <>
      <WelcomeBand me={me} />
      <InformationSection me={me} />
    </>
  );
}

function AccountSkeleton() {
  return (
    <div aria-hidden>
      <div className="grid bg-surface md:grid-cols-2">
        <div className="aspect-[4/3] bg-surface-strong md:aspect-auto md:min-h-[28rem] lg:min-h-[34rem]" />
        <div className="flex flex-col justify-center gap-4 px-gutter py-section-sm md:px-10 lg:px-16 xl:px-24">
          <div className="h-4 w-24 bg-surface-strong" />
          <div className="h-12 w-2/3 bg-surface-strong" />
          <div className="h-6 w-3/4 bg-surface-strong" />
        </div>
      </div>
      <div className="container-page py-section">
        <div className="h-10 w-64 bg-surface" />
        <div className="mt-8 grid gap-x-2 gap-y-8 md:grid-cols-3 lg:mt-10">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index}>
              <div className="aspect-[4/3] bg-surface-strong" />
              <div className="h-56 bg-surface" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** `children` renders between the account details and the shortcuts (the cart's bag section). */
export function AccountPage({ children }: { children?: ReactNode }) {
  return (
    <>
      <Suspense fallback={<AccountSkeleton />}>
        <AccountContent />
      </Suspense>
      {children}
      <ShortcutsSection />
    </>
  );
}

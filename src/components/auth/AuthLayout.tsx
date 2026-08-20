import type { ReactNode } from "react";
import Header from "@/components/home/Header";
import Container from "@/components/home/Container";
import { HeroIntroProvider } from "@/components/home/HeroIntroProvider";
import { NavVisibilityProvider } from "@/components/home/NavVisibility";
import AuthEditorial from "./AuthEditorial";

export default function AuthLayout({
  tag,
  heading,
  description,
  footer,
  children,
}: {
  tag: string;
  heading: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <HeroIntroProvider instant>
      <NavVisibilityProvider>
        <div className="flex min-h-dvh flex-col bg-page">
          <Header />

          <main className="flex flex-1 flex-col">
            {/* `my-auto` (not `justify-center` on `main`) centers this block only when the
                viewport has slack. If content is ever taller than the available space, auto
                margins collapse to 0 instead of clipping — the composition just starts at the
                top and scrolls, rather than the classic flex-centering overflow bug. */}
            <div className="my-auto w-full py-10">
              <Container>
                <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-x-[clamp(32px,calc(2.5vw_+_8px),64px)]">
                  <div className="lg:col-span-6">
                    <AuthEditorial tag={tag} />
                  </div>

                  <div className="lg:col-span-6">
                    <div className="mx-auto w-full max-w-[440px] lg:mx-0">
                      <div className="auth-fade-in" style={{ animationDelay: "90ms" }}>
                        <h1 className="text-[28px] font-semibold tracking-tight text-ink sm:text-[32px] lg:text-[34px]">
                          {heading}
                        </h1>
                        <p className="mt-3 text-[15px] leading-[1.6] text-ink-secondary">
                          {description}
                        </p>
                      </div>

                      <div className="auth-fade-in mt-8" style={{ animationDelay: "190ms" }}>
                        {children}
                      </div>

                      <div className="auth-fade-in mt-8" style={{ animationDelay: "260ms" }}>
                        {footer}
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </div>
          </main>
        </div>
      </NavVisibilityProvider>
    </HeroIntroProvider>
  );
}

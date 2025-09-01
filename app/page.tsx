import { Suspense, lazy } from "react";
import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

// Lazy load Hero component for better performance
const Hero = lazy(() => import("@/components/hero"));

// Lazy load tutorial components
const ConnectSupabaseSteps = lazy(() => import("@/components/tutorial/connect-supabase-steps").then(mod => ({ default: mod.ConnectSupabaseSteps })));
const SignUpUserSteps = lazy(() => import("@/components/tutorial/sign-up-user-steps").then(mod => ({ default: mod.SignUpUserSteps })));

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Next.js Supabase Starter</Link>
              <div className="flex items-center gap-2">
                <DeployButton />
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {/* Hero section with loading fallback */}
          <Suspense fallback={
            <div className="h-[600px] md:h-[800px] lg:h-screen bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-xl">Loading Hero...</p>
              </div>
            </div>
          }>
            <Hero />
          </Suspense>
          
          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Next steps</h2>
            <Suspense fallback={
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Loading tutorial...</p>
              </div>
            }>
              {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
            </Suspense>
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}

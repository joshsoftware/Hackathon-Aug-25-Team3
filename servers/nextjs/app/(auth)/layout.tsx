import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center">
      {/* Background Image */}
      <Image
        src="/auth-bg.jpg"
        alt="Presentation workspace"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-primary/40 to-background/90" />

      {/* Branding */}
      <div className="relative z-10 top-8 left-8">
        <h1 className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          PresentAI
        </h1>
        <p className="text-sm text-primary-foreground/80 mt-1">
          Create stunning presentations with AI
        </p>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full px-4 py-12">{children}</div>

      {/* Footer */}
      <div className="relative z-10 bottom-4 text-center text-sm text-primary-foreground/80">
        <p>Transform your ideas into captivating presentations</p>
      </div>
    </div>
  );
}

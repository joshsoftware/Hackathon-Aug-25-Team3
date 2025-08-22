export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05]" />

      {/* Presentation shapes */}
      <div className="absolute -left-4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -right-4 top-1/2 h-72 w-72 animate-pulse rounded-full bg-secondary/20 blur-3xl" />

      {/* Floating elements */}
      <div className="absolute left-1/4 top-1/4 flex gap-6 animate-float-slow">
        <div className="h-16 w-16 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20" />
        <div className="h-12 w-12 rounded-lg bg-secondary/10 backdrop-blur-sm border border-secondary/20" />
      </div>

      <div className="absolute right-1/4 bottom-1/4 flex gap-6 animate-float-slower">
        <div className="h-20 w-20 rounded-2xl bg-secondary/10 backdrop-blur-sm border border-secondary/20" />
        <div className="h-16 w-16 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20" />
      </div>

      {/* Presentation icons */}
      <div className="absolute left-1/3 bottom-1/3 text-4xl opacity-20 rotate-12">
        📊
      </div>
      <div className="absolute right-1/3 top-1/3 text-4xl opacity-20 -rotate-12">
        📈
      </div>
      <div className="absolute left-2/3 top-1/2 text-4xl opacity-20 rotate-45">
        💡
      </div>
    </div>
  );
}

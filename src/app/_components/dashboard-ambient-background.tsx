export function DashboardAmbientBackground() {
  return (
    <div
      aria-hidden
      className="fixed-viewport-bleed pointer-events-none z-0 overflow-hidden"
    >
      <div className="bg-background absolute inset-0" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-1/4 h-72 w-[68%] rounded-full bg-violet-700/22 blur-3xl" />
        <div className="absolute top-10 right-[-8%] h-56 w-[42%] rounded-full bg-indigo-500/14 blur-3xl" />
        <div className="to-background absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent" />
      </div>
    </div>
  );
}

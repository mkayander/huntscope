export function DashboardAmbientBackground() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-background"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[min(38rem,52vh)] overflow-hidden"
      >
        <div
          className="absolute -left-1/4 top-0 h-72 w-[68%] rounded-full bg-violet-700/22 blur-3xl"
        />
        <div
          className="absolute right-[-8%] top-10 h-56 w-[42%] rounded-full bg-indigo-500/14 blur-3xl"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-background"
        />
      </div>
    </>
  );
}

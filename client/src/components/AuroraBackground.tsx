export default function AuroraBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-100 dark:opacity-0 transition-opacity duration-500">
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-orange-300/60 blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-navy-300/50 blur-3xl animate-float-slow [animation-delay:1.5s]" />
      <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-orange-200/70 blur-3xl animate-float-slow [animation-delay:3s]" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-kalvium-coral/20" />
          <div className="absolute inset-0 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-medium text-kalvium-muted dark:text-kalvium-dark-muted animate-pulse">
          Loading Campus Event Hub...
        </p>
      </div>
    </div>
  );
}

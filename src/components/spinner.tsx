export default function Spinner(props: { simple?: boolean }) {
  return (
    <div className="flex h-screen items-center justify-center">
      {props.simple ? (
        <div className="h-32 w-32 animate-spin rounded-full border-t-4 border-b-4 border-gray-900 dark:border-white"></div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-y-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-full border border-gray-600 bg-white shadow">
            <img src="/loaders/default.gif" alt="Loading" className="absolute -top-0 -left-0 h-16 w-16" />
          </div>
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-400">Loading...</p>
        </div>
      )}
    </div>
  )
}

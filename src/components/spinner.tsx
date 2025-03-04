export default function Spinner(props: { simple?: boolean; size?: string }) {
  function getSize() {
    switch (props.size) {
      case 'xs':
        return '6'
      case 'sm':
        return '8'
      case 'md':
        return '12'
      case 'lg':
        return '24'
      case 'xl':
      default:
        return '32'
    }
  }
  return (
    <div className={props.simple ? 'inline-block' : 'flex h-screen items-center justify-center'}>
      {props.simple ? (
        <div
          className={`h-${getSize()} w-${getSize()} animate-spin rounded-full border-t-4 border-b-4 border-gray-900 dark:border-white`}
        ></div>
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

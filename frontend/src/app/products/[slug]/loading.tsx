export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-4 w-64 bg-gray-200 rounded mb-6" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-36 bg-gray-200 rounded" />
            <div className="h-24 w-full bg-gray-200 rounded" />
            <div className="h-12 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

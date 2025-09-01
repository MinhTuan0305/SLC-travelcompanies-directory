export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-500 to-blue-600">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-white mx-auto mb-6"></div>
        <h1 className="text-3xl font-bold mb-2">Loading...</h1>
        <p className="text-lg opacity-90">Please wait while we prepare your experience</p>
      </div>
    </div>
  );
}

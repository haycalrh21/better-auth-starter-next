"use client";

export default function NotFound() {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // fallback kalau tidak ada history → bisa ke halaman aman default
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold mb-2 text-red-600">Not Found</h2>
      <p className="mb-6 text-gray-700">Could not find requested resource</p>
      <button
        onClick={handleBack}
        className="px-6 py-3 bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-700 transition"
      >
        Return
      </button>
    </div>
  );
}

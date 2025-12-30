import Link from "next/link";
import { RESORTS } from "@/lib/resorts";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">North American Ski Resorts</h2>
        <p className="text-gray-600">
          Select a resort to view 7-day snow forecast and plan your drive
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESORTS.map((resort) => (
          <Link
            key={resort.id}
            href={`/resorts/${resort.slug}`}
            className="block"
          >
            <div className="border rounded-lg p-6 hover:shadow-lg hover:border-blue-500 transition-all">
              <h3 className="text-xl font-semibold mb-2">{resort.name}</h3>
              <p className="text-sm text-gray-600 mb-1">
                {resort.region}, {resort.country}
              </p>
              <p className="text-xs text-gray-500">
                Elevation: {resort.elevation.toLocaleString()}ft
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

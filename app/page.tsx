import Link from "next/link";
import { RESORTS } from "@/lib/resorts";
import { Card, CardContent } from "@/components/ui/Card";
import { getResortGradient, getResortIcon } from "@/lib/resort-images";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Ikon Pass Resorts
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get real-time snow forecasts and traffic-aware drive times for 15 premier North American ski resorts
        </p>
      </div>

      {/* Resort Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESORTS.map((resort) => (
          <Link
            key={resort.id}
            href={`/resorts/${resort.slug}`}
            className="block group"
          >
            <Card hover padding="none" className="overflow-hidden h-full">
              {/* Gradient Background */}
              <div className="relative h-48 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${getResortGradient(resort.id)} group-hover:scale-105 transition-transform duration-300`} />

                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }} />
                </div>

                {/* Large Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl opacity-30 group-hover:opacity-40 transition-opacity">
                    {getResortIcon(resort.id)}
                  </span>
                </div>

                {/* Elevation Badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-900 backdrop-blur-sm">
                    {resort.elevation.toLocaleString()}ft
                  </span>
                </div>

                {/* Resort Name Overlay on Gradient */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">
                    {resort.name}
                  </h3>
                </div>
              </div>

              {/* Resort Info */}
              <CardContent className="p-5">
                <p className="text-sm text-gray-600 font-medium">
                  {resort.region}, {resort.country}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          Click any resort to view detailed forecast and plan your drive
        </p>
      </div>
    </div>
  );
}

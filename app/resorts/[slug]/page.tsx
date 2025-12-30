import Link from "next/link";
import { notFound } from "next/navigation";
import { getResortBySlug } from "@/lib/resorts";
import ForecastGrid from "@/components/ForecastGrid";
import DrivePlanner from "@/components/DrivePlanner";
import FavoriteButton from "@/components/FavoriteButton";
import { getResortGradient, getResortIcon } from "@/lib/resort-images";
import { ArrowLeft } from "lucide-react";

interface ResortPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ResortPage({ params }: ResortPageProps) {
  const { slug } = await params;
  const resort = getResortBySlug(slug);

  if (!resort) {
    notFound();
  }

  return (
    <div>
      {/* Hero Section with Gradient */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getResortGradient(resort.id)}`} />

        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Large Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[20rem] opacity-20">
            {getResortIcon(resort.id)}
          </span>
        </div>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back Link - Absolute positioned */}
        <div className="absolute top-6 left-4 md:left-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-black/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">All Resorts</span>
          </Link>
        </div>

        {/* Resort Title - Absolute positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {resort.name}
                </h1>
                <p className="text-lg text-white/90 drop-shadow-md">
                  {resort.region}, {resort.country} • {resort.elevation.toLocaleString()}ft
                </p>
              </div>
              <div className="hidden sm:block">
                <FavoriteButton resortId={resort.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forecast Section */}
          <div className="lg:col-span-2">
            <section>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">7-Day Forecast</h2>
              <ForecastGrid resort={resort} />
            </section>
          </div>

          {/* Drive Planner Section */}
          <div>
            <section>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Plan Your Drive</h2>
              <DrivePlanner resort={resort} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

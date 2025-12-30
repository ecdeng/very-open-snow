import Link from "next/link";
import { notFound } from "next/navigation";
import { getResortBySlug } from "@/lib/resorts";
import ForecastGrid from "@/components/ForecastGrid";
import DrivePlanner from "@/components/DrivePlanner";
import FavoriteButton from "@/components/FavoriteButton";

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Back to all resorts
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-4xl font-bold">{resort.name}</h1>
          <FavoriteButton resortId={resort.id} />
        </div>
        <p className="text-gray-600">
          {resort.region}, {resort.country} • Elevation: {resort.elevation.toLocaleString()}ft
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7-Day Forecast</h2>
            <ForecastGrid resort={resort} />
          </section>
        </div>

        <div>
          <section>
            <h2 className="text-2xl font-bold mb-4">Plan Your Drive</h2>
            <DrivePlanner resort={resort} />
          </section>
        </div>
      </div>
    </div>
  );
}

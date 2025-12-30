import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Very Open Snow - Ski Resort Conditions & Drive Times",
  description: "Fast snow forecast and drive time planning for North American ski resorts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-5">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ⛷️ Very Open Snow
            </h1>
            <p className="text-sm text-gray-600 mt-1 hidden sm:block">
              Ikon Pass Resort Forecasts & Drive Times
            </p>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Weather data from <span className="font-medium text-gray-700">Open-Meteo</span>
                {' '} • {' '}
                Drive times from <span className="font-medium text-gray-700">Google Maps</span>
              </p>
              <p className="text-xs text-gray-500">
                Built for Ikon Pass holders to plan their perfect powder day
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

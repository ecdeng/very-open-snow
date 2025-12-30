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
      <body className="antialiased">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">⛷️ Very Open Snow</h1>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t mt-12">
          <div className="container mx-auto px-4 py-6 text-sm text-gray-600">
            Weather data from Open-Meteo • Drive times from Google Maps
          </div>
        </footer>
      </body>
    </html>
  );
}

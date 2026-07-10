import "./globals.css";

export const metadata = {
  title: "GrowEasy AI CSV Importer",
  description: "AI-powered CSV lead importer for GrowEasy CRM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
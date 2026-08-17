import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "The Wrap — Indian Market Weekly",
  description:
    "Your weekly digest of everything important in the Indian stock market — market breadth, insider trades, deals, and noteworthy corporate announcements.",
};

// Set the theme class before first paint to avoid a light/dark flash.
const themeInitScript = `
(function(){try{
  var t=localStorage.getItem('theme');
  if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){
    document.documentElement.classList.add('dark');
  }
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

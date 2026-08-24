import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "The Wrap — Indian Market Weekly",
  description:
    "Your weekly digest of everything important in the Indian stock market — market breadth, insider trades, deals, and noteworthy corporate announcements.",
};

// Set the theme class before first paint to avoid a light/dark flash.
// The Wrap is dark by default — only switch to light if the user explicitly chose it.
const themeInitScript = `
(function(){try{
  var t=localStorage.getItem('theme');
  if(t!=='light'){document.documentElement.classList.add('dark');}
}catch(e){document.documentElement.classList.add('dark');}})();
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

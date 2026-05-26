import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "ShiftPal",
  description:
    "Workforce coordination, shift scheduling, attendance, and payroll operations platform.",
  applicationName: "ShiftPal",
  appleWebApp: {
    capable: true,
    title: "ShiftPal",
    statusBarStyle: "black-translucent",
  },
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        
        {children}
      </body>
    </html>
  );
}
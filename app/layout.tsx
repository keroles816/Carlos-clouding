import type { Metadata } from "next";
import {Poppins} from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],

})

export const metadata: Metadata = {
  title: "Dived Clouding",
  description: "Dived Clouding - A place for all your clouding needs", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-poppins  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

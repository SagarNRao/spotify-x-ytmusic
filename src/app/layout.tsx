// src/app/layout.tsx
import React from "react";
import { Provider } from "react-redux";
import { Metadata } from "next";

const geistSans = {
  variable: "--font-geist-sans",
  weight: "100 900",
};

const geistMono = {
  variable: "--font-geist-mono",
  weight: "100 900",
};

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

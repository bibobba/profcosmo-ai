import "./globals.css";

export const metadata = {
  title: "ПРОФКОСМО AI",
  description: "AI-подбор прически",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

import { Montserrat } from "next/font/google";
import "./globals.css";

import Header from "@components/header";
import Footer from "@/components/footer";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "EDUFORM",
  description: "lorem ipsum dolor sit amet",
  icons: {
    icon: "/iconpage.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className="h-full">
      <body
        className={`${montserrat.className} min-h-screen flex flex-col bg-white text-navy-blue`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

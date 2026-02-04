import "@/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "../context/AuthContext";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col relative overflow-x-hidden">
        <div className="h-127 w-128.5 bg-[#B00FF0] -top-64.25 -left-65  rounded-full blur-[200px] fixed"></div>
        <div className="h-127 w-128.5 bg-[#B00FF0] bottom-15 -right-65  rounded-full blur-[200px] fixed"></div>
        <Header />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

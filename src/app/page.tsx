import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import Nominees from "@/components/home/Nominees";
import Winners from "@/components/home/Winners";
import Academy from "@/components/home/Academy";
import Collections from "@/components/home/Collections";
import Directory from "@/components/home/Directory";
import Blog from "@/components/home/Blog";
import Market from "@/components/home/Market";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/home/Footer";
import FloatingNav from "@/components/home/FloatingNav";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Nominees />
        <Winners />
        <Academy />
        <Collections />
        <Directory />
        <Blog />
        <Market />
        <CtaBanner />
      </main>
      <Footer />
      <FloatingNav />
    </>
  );
}

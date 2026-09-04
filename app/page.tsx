import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Services from "@/components/Services";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Credentials from "@/components/Credentials";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";

// Three.js layers are client-only → dynamic import with ssr:false
const ThreeBackground = dynamic(() => import("@/components/ThreeBackground"), {
  ssr: false,
});

// Background FX layers (fixed, behind content)
function BackgroundFX() {
  return (
    <>
      <div className="pointer-events-none fixed  inset-0 -z-10 overflow-hidden">
        {/* 3D particle starfield */}
        <ThreeBackground />
        <div className="absolute -top-36 -left-32 h-[520px] w-[520px] rounded-full bg-primary opacity-45 blur-[90px] animate-float" />
        <div className="absolute -bottom-32 -right-28 h-[420px] w-[420px] rounded-full bg-primary-light opacity-45 blur-[90px] animate-float-slow" />
        <div className="absolute top-[45%] left-[55%] h-[300px] w-[300px] rounded-full bg-accent opacity-20 blur-[90px] animate-float" />
      </div>
      <div className="grid-overlay" />
    </>
  );
}

export default function Home() {
  return (
    <>
      <BackgroundFX />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Credentials />    
        <Services />     
        <Stats />      
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
    </>
  );
}


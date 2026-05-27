import React from 'react';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import Barbers from './components/sections/Barbers';
import Booking from './components/sections/Booking';
import Testimonials from './components/sections/Testimonials';
import Contact from './components/sections/Contact';
import BackToTop from './components/ui/BackToTop';
import { ClientAuthProvider } from './components/ui/ClientAuthModal';
import { useActiveSection } from './hooks/useActiveSection';
import './styles/globals.css';
import styles from './App.module.css';


const SECTION_IDS = ['home', 'services', 'barbers', 'book', 'testimonials', 'contact'];

const AppInner: React.FC = () => {
  const activeSection = useActiveSection(SECTION_IDS);

  return (
    <div className={styles.layout}>
      <Sidebar activeSection={activeSection} />
      <MobileNav />
      <main className={styles.main} id="main-content">
        <Hero />
        <Services />
        <Barbers />
        <Booking />
        <Testimonials />
        <Contact />
      </main>
      <BackToTop />
    </div>
  );
};

const App: React.FC = () => {

  return (
    <ClientAuthProvider>
      <AppInner />
    </ClientAuthProvider>
  );
};

export default App;

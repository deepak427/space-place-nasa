import { Routes, Route, useNavigate } from 'react-router-dom'
import { useLanguage } from './context/LanguageContext'
import Header from './components/Header'
import NavCategories from './components/NavCategories'
import FeaturedSection from './components/FeaturedSection'
import ArtChallenge from './components/ArtChallenge'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import Onboarding from './components/Onboarding'
import MoonPage from './components/MoonPage'
import MoonPhasesPage from './components/MoonPhasesPage'
import MoonDistancePage from './components/MoonDistancePage'
import LaunchPage from './components/LaunchPage'
import MenuListingPage from './components/MenuListingPage'
import NeptunePage from './components/NeptunePage'
import TopicMenuPage from './components/TopicMenuPage'
import EarthPage from './components/EarthPage'
import styles from './App.module.css'

function HomeContent() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <>
      <div className={styles.navWrapper}>
        <NavCategories onMoonClick={() => navigate(`/all-about-the-moon/${language}/`)} />
      </div>
      <main className={styles.main}>
        <div className={styles.contentContainer}>
          <FeaturedSection 
            onMoonClick={() => navigate(`/all-about-the-moon/${language}/`)} 
            onPhasesClick={() => navigate(`/moon-phases/${language}/`)}
            onDistanceClick={() => navigate(`/moon-distance/${language}/`)}
            onLaunchClick={() => navigate(`/launching-into-space/${language}/`)}
          />
          <ArtChallenge />
        </div>
        <BottomNav />
      </main>
    </>
  );
}

export default function App() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <>
      <Onboarding />
      <div className={styles.layout}>
        <Header onLogoClick={() => navigate(`/${language}/`)} />

        <Routes>
          {/* Home routes */}
          <Route path="/" element={<HomeContent />} />
          <Route path="/:lang/" element={<HomeContent />} />
          <Route path="/:lang" element={<HomeContent />} />

          <Route path="/all-about-the-moon/:lang/*" element={
            <main className={styles.main}>
              <MoonPage onBack={() => navigate(`/${language}/`)} />
            </main>
          } />

          <Route path="/moon-phases/:lang/*" element={
            <main className={styles.main}>
              <MoonPhasesPage onBack={() => navigate(`/${language}/`)} />
            </main>
          } />

          <Route path="/moon-distance/:lang/*" element={
            <main className={styles.main}>
              <MoonDistancePage onBack={() => navigate(`/${language}/`)} />
            </main>
          } />

          <Route path="/launching-into-space/:lang/*" element={
            <main className={styles.main}>
              <LaunchPage onBack={() => navigate(`/${language}/`)} />
            </main>
          } />

          <Route path="/menu/:category/:lang?" element={
            <main className={styles.main}>
              <MenuListingPage />
            </main>
          } />
 
          <Route path="/neptune/:lang/*" element={
            <main className={styles.main}>
              <NeptunePage onBack={() => navigate(`/${language}/`)} />
            </main>
          } />
 
          <Route path="/topic/earth/:lang?" element={
            <main className={styles.main}>
              <EarthPage />
            </main>
          } />
 
          <Route path="/topic/:topic/:lang?" element={
            <main className={styles.main}>
              <TopicMenuPage />
            </main>
          } />
        </Routes>

        <Footer />
      </div>
    </>
  )
}


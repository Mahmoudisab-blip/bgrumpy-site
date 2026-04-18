"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { flashItems, type FlashItem, type FlashStatus } from "@/src/data/flashItems";
import { portfolioItems } from "@/src/data/portfolioItems";
import { heroImages, studioInfo } from "@/src/data/site";

type ScreenId = "home" | "flash" | "gallery" | "quote" | "booking" | "profile" | "contact";

type IconName = "home" | "flash" | "gallery" | "quote" | "calendar" | "profile" | "contact" | "heart";

const screenLabels: Record<ScreenId, string> = {
  home: "Accueil",
  flash: "Flashs",
  gallery: "Galerie",
  quote: "Devis",
  booking: "Réserver",
  profile: "Profil",
  contact: "Studio",
};

const screenOrder: ScreenId[] = ["home", "flash", "gallery", "quote", "booking", "profile", "contact"];
const bottomNav: ScreenId[] = ["home", "flash", "gallery", "quote", "profile"];

const filters = ["Fineline", "Botanique", "Blackwork", "Ornemental"];
const bodyZones = ["Avant-bras", "Côtes", "Épaule", "Dos", "Cheville"];
const styles = ["Botanique fine", "Noir et gris", "Ornemental", "Graphique doux"];
const budgets = ["150 - 250 €", "250 - 450 €", "450 - 700 €", "Sur mesure"];
const availability = ["Mardi matin", "Jeudi après-midi", "Samedi matin"];
const services = ["Projet sur mesure", "Flash disponible", "Retouche fine"];
const timeSlots = ["10:30", "13:45", "16:15"];

const statusStyles: Record<FlashStatus, string> = {
  Disponible: "available",
  "En étude": "study",
  Réservé: "reserved",
};

function AppIcon({ icon }: { icon: IconName }) {
  return (
    <svg aria-hidden="true" className="app-icon" viewBox="0 0 24 24" fill="none">
      {icon === "home" ? (
        <path d="M4.75 11.3 12 5.45l7.25 5.85v7.2a1.75 1.75 0 0 1-1.75 1.75h-11a1.75 1.75 0 0 1-1.75-1.75v-7.2Z" />
      ) : null}
      {icon === "flash" ? <path d="m13.4 3.75-7.1 9.1h5.35l-1.05 7.4 7.1-9.15h-5.3l1-7.35Z" /> : null}
      {icon === "gallery" ? (
        <path d="M5.25 5.75h13.5v12.5H5.25V5.75Zm0 9 3.3-3.15 2.75 2.55 2.05-1.95 5.4 5.05" />
      ) : null}
      {icon === "quote" ? (
        <path d="M6.25 4.75h11.5v14.5H6.25V4.75Zm3 4h5.5m-5.5 3h5.5m-5.5 3h3" />
      ) : null}
      {icon === "calendar" ? (
        <path d="M6.25 5.75h11.5v12.5H6.25V5.75Zm0 4h11.5M9 4.25v3m6-3v3" />
      ) : null}
      {icon === "profile" ? (
        <path d="M8.35 19.25a4.05 4.05 0 0 1 7.3 0M12 12.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" />
      ) : null}
      {icon === "contact" ? (
        <path d="M12 20.25s6-5.15 6-10.25a6 6 0 0 0-12 0c0 5.1 6 10.25 6 10.25Zm0-7.65a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" />
      ) : null}
      {icon === "heart" ? (
        <path d="M12 19.1s-6.75-3.8-6.75-8.65A3.75 3.75 0 0 1 12 8.2a3.75 3.75 0 0 1 6.75 2.25C18.75 15.3 12 19.1 12 19.1Z" />
      ) : null}
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="app-brand-mark" aria-hidden="true">
      BG
    </div>
  );
}

function ScreenSwitcher({
  activeScreen,
  onScreenChange,
}: {
  activeScreen: ScreenId;
  onScreenChange: (screen: ScreenId) => void;
}) {
  return (
    <div className="app-screen-switcher" aria-label="Choisir un écran">
      {screenOrder.map((screen) => (
        <button
          key={screen}
          type="button"
          className={activeScreen === screen ? "is-active" : ""}
          onClick={() => onScreenChange(screen)}
          aria-pressed={activeScreen === screen}
        >
          {screenLabels[screen]}
        </button>
      ))}
    </div>
  );
}

function AppHeader({ onScreenChange }: { onScreenChange: (screen: ScreenId) => void }) {
  return (
    <header className="app-topbar">
      <div className="app-topbar-identity">
        <BrandMark />
        <div>
          <p>{studioInfo.name}</p>
          <span>Studio privé</span>
        </div>
      </div>
      <button type="button" className="app-icon-button" onClick={() => onScreenChange("contact")} aria-label="Ouvrir le studio">
        <AppIcon icon="contact" />
      </button>
    </header>
  );
}

function BottomNavigation({
  activeScreen,
  onScreenChange,
}: {
  activeScreen: ScreenId;
  onScreenChange: (screen: ScreenId) => void;
}) {
  return (
    <nav className="app-bottom-nav" aria-label="Navigation app">
      {bottomNav.map((screen) => {
        const icon: IconName =
          screen === "home" ? "home" : screen === "flash" ? "flash" : screen === "gallery" ? "gallery" : screen === "quote" ? "quote" : "profile";

        return (
          <button
            key={screen}
            type="button"
            className={activeScreen === screen ? "is-active" : ""}
            onClick={() => onScreenChange(screen)}
            aria-current={activeScreen === screen ? "page" : undefined}
          >
            <AppIcon icon={icon} />
            <span>{screenLabels[screen]}</span>
          </button>
        );
      })}
    </nav>
  );
}

function GlassButton({
  children,
  onClick,
  variant = "soft",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "soft" | "dark";
}) {
  return (
    <button type="button" className={`app-action-button ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="app-section-title">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  );
}

function HomeScreen({ onScreenChange }: { onScreenChange: (screen: ScreenId) => void }) {
  return (
    <div className="app-screen-content">
      <section className="app-hero-card">
        <Image src={heroImages.main.src} alt={heroImages.main.alt} fill priority sizes="390px" className="app-cover-image" />
        <div className="app-hero-overlay" />
        <div className="app-hero-copy">
          <span>Villiers-sur-Morin</span>
          <h1>Tatouage privé, organique et précis.</h1>
          <p>Des projets cadrés, une réponse claire, une esthétique noire et végétale.</p>
          <div className="app-hero-actions">
            <GlassButton variant="dark" onClick={() => onScreenChange("quote")}>
              Demander un devis
            </GlassButton>
            <GlassButton onClick={() => onScreenChange("flash")}>Voir les flashs</GlassButton>
          </div>
        </div>
      </section>

      <section className="app-quick-grid" aria-label="Accès rapides">
        {[
          { label: "Flashs", detail: "Collection", screen: "flash" as ScreenId, icon: "flash" as IconName },
          { label: "Galerie", detail: "Portfolio", screen: "gallery" as ScreenId, icon: "gallery" as IconName },
          { label: "Réserver", detail: "Créneau", screen: "booking" as ScreenId, icon: "calendar" as IconName },
          { label: "Studio", detail: "Contact", screen: "contact" as ScreenId, icon: "contact" as IconName },
        ].map((item) => (
          <button key={item.label} type="button" className="app-quick-card" onClick={() => onScreenChange(item.screen)}>
            <span>
              <AppIcon icon={item.icon} />
            </span>
            <strong>{item.label}</strong>
            <small>{item.detail}</small>
          </button>
        ))}
      </section>

      <section className="app-glass-panel">
        <SectionTitle eyebrow="Aujourd'hui" title="Une lecture calme avant l'aiguille." />
        <div className="app-progress-list">
          {[
            ["Analyse projet", "48 h"],
            ["Session privée", "Sur rendez-vous"],
            ["Flash botanique", "4 pièces"],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="app-image-strip">
        {portfolioItems.slice(0, 3).map((item) => (
          <button key={item.id} type="button" onClick={() => onScreenChange("gallery")} aria-label={`Voir ${item.title}`}>
            <Image src={item.image.src} alt={item.image.alt} fill sizes="130px" className="app-cover-image" />
          </button>
        ))}
      </section>
    </div>
  );
}

function GalleryScreen() {
  return (
    <div className="app-screen-content">
      <SectionTitle eyebrow="Galerie" title="Pièces noires, lignes fines, peau respirante." />

      <div className="app-filter-row" aria-label="Filtres galerie">
        {filters.map((filter, index) => (
          <button key={filter} type="button" className={index === 0 ? "is-active" : ""}>
            {filter}
          </button>
        ))}
      </div>

      <section className="app-editorial-grid">
        {portfolioItems.map((item, index) => (
          <article key={item.id} className={index === 0 ? "featured" : ""}>
            <Image src={item.image.src} alt={item.image.alt} fill sizes={index === 0 ? "360px" : "180px"} className="app-cover-image" />
            <div>
              <span>{item.category}</span>
              <strong>{item.title}</strong>
              <small>{item.placement}</small>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function FlashCard({
  item,
  selected,
  onSelect,
}: {
  item: FlashItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" className={`app-flash-card ${selected ? "is-selected" : ""}`} onClick={onSelect}>
      <span className={`app-status ${statusStyles[item.status]}`}>{item.status}</span>
      <Image src={item.image.src} alt={item.image.alt} fill sizes="180px" className="app-cover-image" />
      <div>
        <strong>{item.title}</strong>
        <small>{item.style}</small>
      </div>
    </button>
  );
}

function FlashScreen({ onScreenChange }: { onScreenChange: (screen: ScreenId) => void }) {
  const [selectedId, setSelectedId] = useState(flashItems[0]?.id ?? "");
  const selectedFlash = flashItems.find((item) => item.id === selectedId) ?? flashItems[0];

  return (
    <div className="app-screen-content">
      <SectionTitle eyebrow="Flashs disponibles" title="Une collection sobre, rare et cadrée." />

      <section className="app-flash-feature">
        <div className="app-flash-feature-media">
          <Image src={selectedFlash.image.src} alt={selectedFlash.image.alt} fill sizes="360px" className="app-cover-image" />
          <span className={`app-status ${statusStyles[selectedFlash.status]}`}>{selectedFlash.status}</span>
        </div>
        <div className="app-flash-feature-copy">
          <p>{selectedFlash.style}</p>
          <h2>{selectedFlash.title}</h2>
          <span>{selectedFlash.size} · {selectedFlash.placement}</span>
          <small>{selectedFlash.description}</small>
          <GlassButton variant="dark" onClick={() => onScreenChange("quote")}>
            Demander ce flash
          </GlassButton>
        </div>
      </section>

      <div className="app-horizontal-cards" aria-label="Flashs">
        {flashItems.map((item) => (
          <FlashCard key={item.id} item={item} selected={item.id === selectedId} onSelect={() => setSelectedId(item.id)} />
        ))}
      </div>
    </div>
  );
}

function QuoteScreen({ onScreenChange }: { onScreenChange: (screen: ScreenId) => void }) {
  return (
    <div className="app-screen-content">
      <SectionTitle eyebrow="Demande de devis" title="Décrire le projet sans lourdeur." />

      <section className="app-glass-panel">
        <div className="app-step-line">
          <span className="is-done">1</span>
          <span className="is-active">2</span>
          <span>3</span>
          <span>4</span>
        </div>
        <div className="app-form-grid">
          <label>
            Zone du corps
            <select defaultValue={bodyZones[0]}>
              {bodyZones.map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </select>
          </label>
          <label>
            Taille souhaitée
            <input defaultValue="12 x 8 cm environ" />
          </label>
          <label>
            Style
            <select defaultValue={styles[0]}>
              {styles.map((style) => (
                <option key={style}>{style}</option>
              ))}
            </select>
          </label>
          <label>
            Budget
            <select defaultValue={budgets[1]}>
              {budgets.map((budget) => (
                <option key={budget}>{budget}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="app-large-field">
          Intention du projet
          <textarea defaultValue="Une pièce végétale fine, pas trop dense, avec une composition qui suit le mouvement du bras." />
        </label>
      </section>

      <section className="app-upload-panel">
        <div>
          <strong>Inspirations</strong>
          <span>3 images ajoutées</span>
        </div>
        <button type="button">Ajouter</button>
      </section>

      <section className="app-glass-panel">
        <SectionTitle eyebrow="Disponibilités" title="Préférences calmes." />
        <div className="app-choice-grid">
          {availability.map((slot, index) => (
            <button key={slot} type="button" className={index === 1 ? "is-active" : ""}>
              {slot}
            </button>
          ))}
        </div>
      </section>

      <GlassButton variant="dark" onClick={() => onScreenChange("booking")}>
        Continuer vers la réservation
      </GlassButton>
    </div>
  );
}

function BookingScreen() {
  return (
    <div className="app-screen-content">
      <SectionTitle eyebrow="Réservation" title="Choisir le bon cadre, puis confirmer." />

      <section className="app-glass-panel">
        <div className="app-choice-grid service">
          {services.map((service, index) => (
            <button key={service} type="button" className={index === 0 ? "is-active" : ""}>
              {service}
            </button>
          ))}
        </div>
      </section>

      <section className="app-calendar-card">
        <div className="app-calendar-head">
          <span>Mai 2026</span>
          <strong>Créneaux proposés</strong>
        </div>
        <div className="app-days-grid" aria-label="Calendrier">
          {["12", "13", "14", "15", "16", "17", "18"].map((day, index) => (
            <button key={day} type="button" className={index === 3 ? "is-active" : ""}>
              <span>{["Mar", "Mer", "Jeu", "Ven", "Sam", "Dim", "Lun"][index]}</span>
              {day}
            </button>
          ))}
        </div>
        <div className="app-slot-row">
          {timeSlots.map((slot, index) => (
            <button key={slot} type="button" className={index === 1 ? "is-active" : ""}>
              {slot}
            </button>
          ))}
        </div>
      </section>

      <section className="app-summary-card">
        <p>Récapitulatif</p>
        <div>
          <span>Service</span>
          <strong>Projet sur mesure</strong>
        </div>
        <div>
          <span>Créneau</span>
          <strong>Vendredi 15 mai · 13:45</strong>
        </div>
        <div>
          <span>Acompte</span>
          <strong>À confirmer au studio</strong>
        </div>
        <button type="button">Confirmer les informations</button>
      </section>
    </div>
  );
}

function ProfileScreen({ onScreenChange }: { onScreenChange: (screen: ScreenId) => void }) {
  return (
    <div className="app-screen-content">
      <section className="app-profile-card">
        <div>
          <BrandMark />
          <div>
            <span>Compte client</span>
            <h1>Sabrina M.</h1>
            <p>2 demandes envoyées · 1 rendez-vous à venir</p>
          </div>
        </div>
        <button type="button" onClick={() => onScreenChange("contact")}>Studio</button>
      </section>

      <section className="app-profile-grid">
        {[
          ["Demandes", "Projet botanique en analyse"],
          ["Rendez-vous", "15 mai · 13:45"],
          ["Favoris", "4 flashs sauvegardés"],
          ["Notifications", "Réponse sous 48 h"],
          ["Paramètres", "Infos, confidentialité"],
        ].map(([label, value]) => (
          <button key={label} type="button">
            <strong>{label}</strong>
            <span>{value}</span>
          </button>
        ))}
      </section>

      <section className="app-favorites">
        <SectionTitle eyebrow="Flashs sauvegardés" title="À garder sous la main." />
        <div>
          {flashItems.slice(0, 3).map((item) => (
            <button key={item.id} type="button" onClick={() => onScreenChange("flash")}>
              <Image src={item.image.src} alt={item.image.alt} fill sizes="98px" className="app-cover-image" />
              <span>
                <AppIcon icon="heart" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContactScreen({ onScreenChange }: { onScreenChange: (screen: ScreenId) => void }) {
  return (
    <div className="app-screen-content">
      <SectionTitle eyebrow="Contact" title="Un studio privé, une adresse transmise avec clarté." />

      <section className="app-map-card">
        <Image src={heroImages.secondary.src} alt={heroImages.secondary.alt} fill sizes="360px" className="app-cover-image" />
        <div>
          <span>{studioInfo.location}</span>
          <strong>B.Grumpy Tattoo</strong>
        </div>
      </section>

      <section className="app-contact-grid">
        <div>
          <span>Horaires</span>
          <strong>Mar - Sam</strong>
          <small>10:00 - 18:30</small>
        </div>
        <div>
          <span>Instagram</span>
          <strong>@bgrumpy.tattoo</strong>
          <small>Flashs et projets récents</small>
        </div>
      </section>

      <section className="app-glass-panel">
        <SectionTitle eyebrow="Message" title="Question courte." />
        <div className="app-form-grid single">
          <label>
            Email
            <input defaultValue="contact@email.fr" />
          </label>
          <label>
            Sujet
            <input defaultValue="Question avant demande" />
          </label>
        </div>
        <label className="app-large-field">
          Message
          <textarea defaultValue="Bonjour, je souhaite vérifier si mon idée correspond à votre univers avant d'envoyer un devis complet." />
        </label>
      </section>

      <section className="app-faq-card">
        <p>Questions fréquentes</p>
        <button type="button">Comment préparer les références ?</button>
        <button type="button">Quel délai pour une réponse ?</button>
        <button type="button" onClick={() => onScreenChange("quote")}>Envoyer une demande complète</button>
      </section>
    </div>
  );
}

function ScreenBody({
  activeScreen,
  onScreenChange,
}: {
  activeScreen: ScreenId;
  onScreenChange: (screen: ScreenId) => void;
}) {
  if (activeScreen === "flash") {
    return <FlashScreen onScreenChange={onScreenChange} />;
  }

  if (activeScreen === "gallery") {
    return <GalleryScreen />;
  }

  if (activeScreen === "quote") {
    return <QuoteScreen onScreenChange={onScreenChange} />;
  }

  if (activeScreen === "booking") {
    return <BookingScreen />;
  }

  if (activeScreen === "profile") {
    return <ProfileScreen onScreenChange={onScreenChange} />;
  }

  if (activeScreen === "contact") {
    return <ContactScreen onScreenChange={onScreenChange} />;
  }

  return <HomeScreen onScreenChange={onScreenChange} />;
}

export default function MobileAppExperience() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");
  const activeTitle = useMemo(() => screenLabels[activeScreen], [activeScreen]);

  return (
    <section className="app-mobile-page">
      <div className="app-mobile-shell container-wide">
        <aside className="app-brand-panel">
          <p>Application mobile premium</p>
          <h1>B.Grumpy Tattoo</h1>
          <span>Calme, précision, botanique noire et expérience privée.</span>

          <div className="app-palette" aria-label="Palette">
            {["Ivoire", "Sable", "Taupe", "Kaki", "Sauge"].map((color) => (
              <i key={color} title={color} />
            ))}
          </div>

          <ScreenSwitcher activeScreen={activeScreen} onScreenChange={setActiveScreen} />
        </aside>

        <div className="app-device-area" aria-label={`Écran ${activeTitle}`}>
          <div className="app-device-frame">
            <div className="app-device">
              <AppHeader onScreenChange={setActiveScreen} />
              <main className="app-screen" key={activeScreen}>
                <ScreenBody activeScreen={activeScreen} onScreenChange={setActiveScreen} />
              </main>
              <BottomNavigation activeScreen={activeScreen} onScreenChange={setActiveScreen} />
            </div>
          </div>
        </div>

        <aside className="app-notes-panel">
          <div>
            <span>Écran actif</span>
            <strong>{activeTitle}</strong>
          </div>
          <p>Devis clair, collection de flashs, galerie éditoriale, réservation et espace client dans une même direction visuelle.</p>
          <button type="button" onClick={() => setActiveScreen("quote")}>
            Ouvrir le devis
          </button>
        </aside>
      </div>
    </section>
  );
}

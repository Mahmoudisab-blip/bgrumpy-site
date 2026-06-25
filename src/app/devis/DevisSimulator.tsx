"use client";

import { useMemo, useState } from "react";
import styles from "./DevisPage.module.css";

const stylesOptions = [
  { label: "Fineline", value: 1 },
  { label: "Ornemental", value: 1.18 },
  { label: "Réaliste", value: 1.38 },
  { label: "Couleur", value: 1.45 },
];

const placementOptions = [
  { label: "Bras", value: 1 },
  { label: "Avant-bras", value: 1 },
  { label: "Côtes", value: 1.2 },
  { label: "Main", value: 1.28 },
  { label: "Dos", value: 1.12 },
];

const detailOptions = [
  { label: "Simple", value: 0 },
  { label: "Détaillé", value: 80 },
  { label: "Très détaillé", value: 160 },
];

const clampEstimate = (value: number) => Math.min(5000, Math.max(90, value));

export default function DevisSimulator() {
  const [size, setSize] = useState(10);
  const [style, setStyle] = useState(stylesOptions[0]);
  const [placement, setPlacement] = useState(placementOptions[0]);
  const [detail, setDetail] = useState(detailOptions[0]);

  const estimate = useMemo(() => {
    const base = 80 + size * 18 + detail.value;
    const center = clampEstimate(Math.round(base * style.value * placement.value));
    const low = clampEstimate(Math.round(center * 0.82));
    const high = clampEstimate(Math.round(center * 1.22));

    return { low, high };
  }, [detail.value, placement.value, size, style.value]);

  return (
    <section className={styles.simulator} id="simulateur" aria-labelledby="simulateur-title">
      <div className={styles.simulatorHeader}>
        <p className={styles.kicker}>Simulateur</p>
        <p className={styles.simulatorTag}>
          Calcule une fourchette de prix selon le style, la taille, la zone et le niveau de détails.
        </p>
        <h2 className={styles.simulatorTitle} id="simulateur-title">
          Estime ton projet
        </h2>
        <p className={styles.simulatorIntro}>
          Une fourchette rapide pour préparer ta demande. Le devis final dépendra du dessin,
          de l&apos;emplacement et du temps de tatouage.
        </p>
      </div>

      <div className={styles.simulatorControls}>
        <label className={styles.simulatorRange}>
          <span>Taille</span>
          <strong>{size} cm</strong>
          <input
            className={styles.range}
            type="range"
            min="3"
            max="45"
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
          />
        </label>

        <div className={styles.simulatorGroup}>
          <span>Style</span>
          <div className={styles.simulatorOptions}>
            {stylesOptions.map((option) => (
              <button
                className={`${styles.simulatorOption} ${
                  style.label === option.label ? styles.simulatorOptionActive : ""
                }`}
                key={option.label}
                type="button"
                onClick={() => setStyle(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.simulatorGroup}>
          <span>Zone</span>
          <div className={styles.simulatorOptions}>
            {placementOptions.map((option) => (
              <button
                className={`${styles.simulatorOption} ${
                  placement.label === option.label ? styles.simulatorOptionActive : ""
                }`}
                key={option.label}
                type="button"
                onClick={() => setPlacement(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.simulatorGroup}>
          <span>Détails</span>
          <div className={styles.simulatorOptions}>
            {detailOptions.map((option) => (
              <button
                className={`${styles.simulatorOption} ${
                  detail.label === option.label ? styles.simulatorOptionActive : ""
                }`}
                key={option.label}
                type="button"
                onClick={() => setDetail(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.simulatorResult} aria-live="polite">
        <span>Estimation</span>
        <strong>
          {estimate.low} € - {estimate.high} €
        </strong>
        <small>À confirmer avec le formulaire juste en dessous.</small>
      </div>
    </section>
  );
}

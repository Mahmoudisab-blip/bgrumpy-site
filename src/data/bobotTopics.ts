export type BobotTopic = {
  id: string;
  category: string;
  priority?: number;
  keywords: string[];
  intents: string[];
  questionPatterns: string[];
  answerKeys: string[];
};

type TopicSeed = {
  id: string;
  category: string;
  label: string;
  keywords: string[];
  intents?: string[];
  answerKeys: string[];
  priority?: number;
};

type TopicTuple = [
  id: string,
  category: string,
  label: string,
  keywords: string[],
  intents?: string[],
  answerKeys?: string[],
  priority?: number,
];

const painZones = new Set([
  "douleur_bras",
  "douleur_avant_bras",
  "douleur_interieur_bras",
  "douleur_coude",
  "douleur_poignet",
  "douleur_epaule",
]);

const handZones = new Set(["douleur_main", "douleur_doigts"]);
const ribZones = new Set(["douleur_cotes", "douleur_sternum"]);

const defaultIntents = (seed: TopicSeed) => [
  seed.category,
  seed.label,
  seed.id.replaceAll("_", " "),
  ...seed.keywords,
  ...(seed.intents ?? []),
];

const englishKeywordsByAnswerKey: Record<string, string[]> = {
  conversation: [
    "hello",
    "hi",
    "hey",
    "good morning",
    "good evening",
    "thank you",
    "thanks",
    "who are you",
    "help",
    "assistant",
  ],
  cover: [
    "cover up",
    "coverup",
    "old tattoo",
    "hide a tattoo",
    "fix a tattoo",
    "rework tattoo",
  ],
  douleur: [
    "does it hurt",
    "tattoo pain",
    "painful tattoo",
    "how painful",
    "sensitive area",
    "first tattoo pain",
  ],
  douleur_bras: [
    "arm pain",
    "forearm pain",
    "inner arm pain",
    "elbow tattoo pain",
    "wrist tattoo pain",
    "shoulder tattoo pain",
  ],
  douleur_cotes: [
    "rib tattoo pain",
    "ribs pain",
    "sternum tattoo pain",
    "chest tattoo pain",
  ],
  douleur_main: [
    "hand tattoo pain",
    "finger tattoo pain",
    "hand tattoo",
    "finger tattoo",
  ],
  flashs: [
    "flash tattoo",
    "available flash",
    "available design",
    "reserve a flash",
    "book a flash",
    "change a flash",
  ],
  preparation: [
    "prepare my session",
    "before tattoo",
    "before appointment",
    "what should i do before",
    "can i drink alcohol",
    "what should i wear",
    "eat before tattoo",
    "sleep before tattoo",
  ],
  prix: [
    "tattoo price",
    "tattoo cost",
    "how much",
    "quote",
    "estimate",
    "budget",
    "deposit",
    "payment",
    "pay by card",
    "cash",
  ],
  acompte: [
    "deposit",
    "tattoo deposit",
    "booking deposit",
    "non refundable deposit",
    "refund deposit",
    "reschedule deposit",
    "cancel appointment deposit",
  ],
  rendez_vous: [
    "appointment",
    "book appointment",
    "booking",
    "schedule",
    "availability",
    "available slot",
    "cancel appointment",
    "reschedule",
  ],
  securite: [
    "infection",
    "infected",
    "fever",
    "pus",
    "swollen",
    "allergy",
    "sterile",
    "hygiene",
    "clean studio",
    "single use needle",
  ],
  soins: [
    "aftercare",
    "healing",
    "heal tattoo",
    "wash tattoo",
    "clean tattoo",
    "cream",
    "second skin",
    "wrap",
    "itchy tattoo",
    "scabbing",
    "sun after tattoo",
    "swimming after tattoo",
  ],
  style: [
    "custom tattoo",
    "manga tattoo",
    "anime tattoo",
    "floral tattoo",
    "flower tattoo",
    "blackwork",
    "black and grey",
    "fine line",
    "dotwork",
    "lettering",
    "symbol tattoo",
    "reference pictures",
  ],
  vieillissement: [
    "will it age well",
    "aging",
    "ageing",
    "will it fade",
    "long term",
    "small details",
    "thin lines",
    "placement",
    "tattoo size",
  ],
};

const makeQuestionPatterns = (seed: TopicSeed) => [
  `Question sur ${seed.label} ?`,
  `Tu peux m'expliquer ${seed.label} ?`,
  `Comment ça se passe pour ${seed.label} ?`,
  `Je dois savoir quoi sur ${seed.label} ?`,
  `Est-ce que tu peux me rassurer sur ${seed.label} ?`,
  `J'ai une question sur ${seed.label}.`,
  `Bryan conseille quoi pour ${seed.label} ?`,
  `Je veux éviter les erreurs avec ${seed.label}.`,
  `C'est important pour ${seed.label} ?`,
  `Tu me répondrais quoi au studio pour ${seed.label} ?`,
  `Question about ${seed.label}?`,
  `Can you explain ${seed.label}?`,
  `What should I know about ${seed.label}?`,
  `How does ${seed.label} work?`,
  `Can you help me with ${seed.label}?`,
];

const makeTopic = (seed: TopicSeed): BobotTopic => ({
  id: seed.id,
  category: seed.category,
  priority: seed.priority,
  keywords: [
    seed.label,
    seed.category,
    seed.id.replaceAll("_", " "),
    ...seed.keywords,
    ...seed.answerKeys.flatMap((answerKey) => englishKeywordsByAnswerKey[answerKey] ?? []),
  ],
  intents: defaultIntents(seed),
  questionPatterns: makeQuestionPatterns(seed),
  answerKeys: seed.answerKeys,
});

const answerKeyFor = (id: string, category: string) => {
  if (painZones.has(id)) return "douleur_bras";
  if (handZones.has(id)) return "douleur_main";
  if (ribZones.has(id)) return "douleur_cotes";
  if (id.startsWith("douleur")) return "douleur";
  if (["preparation", "contraintes santé"].includes(category)) return "preparation";
  if (category === "acompte") return "acompte";
  if (["prix", "devis", "paiement"].includes(category)) return "prix";
  if (category === "rendez-vous") return "rendez_vous";
  if (category === "flashs") return "flashs";
  if (["manga", "anime"].includes(category)) return "style_manga";
  if (category === "floral") return "style_floral";
  if (category === "blackwork") return "style_blackwork";
  if (category === "fine line") return "style_fine_line";
  if (id === "lettrage") return "style_lettrage";
  if (id === "tatouage_couleur") return "style_couleur";
  if (["dotwork", "whip shading"].includes(category)) return "style";
  if (["cover", "recouvrement"].includes(category)) return "cover";
  if (category === "cicatrisation") return "cicatrisation";
  if (["soins", "retouches"].includes(category)) return "soins";
  if (["hygiène", "sécurité", "mineurs"].includes(category)) return "securite";
  if (["vieillissement", "placements", "premier tatouage"].includes(category)) return "vieillissement";
  return "conversation";
};

const seedTuples: TopicTuple[] = [
  ["douleur_generale", "douleur", "douleur générale", ["mal tatouage", "tatouage douloureux", "douleur tattoo"]],
  ["douleur_premier_tatouage", "douleur", "douleur premier tatouage", ["premier tatouage mal", "peur douleur", "premier tattoo"]],
  ["douleur_bras", "douleur", "douleur bras", ["bras fait mal", "tatouage bras douleur", "bras supportable"]],
  ["douleur_avant_bras", "douleur", "douleur avant-bras", ["avant bras douleur", "tatouage avant bras", "avant-bras fait mal"]],
  ["douleur_interieur_bras", "douleur", "douleur intérieur bras", ["intérieur bras sensible", "bras interne douleur", "tatouage intérieur bras"]],
  ["douleur_coude", "douleur", "douleur coude", ["coude fait mal", "tatouage coude", "pli du coude"]],
  ["douleur_poignet", "douleur", "douleur poignet", ["poignet sensible", "tatouage poignet", "poignet fait mal"]],
  ["douleur_main", "douleur", "douleur main", ["main fait mal", "tatouage main douleur", "dessus main"]],
  ["douleur_doigts", "douleur", "douleur doigts", ["tatouage doigts", "doigt fait mal", "finger tattoo"]],
  ["douleur_cotes", "douleur", "douleur côtes", ["côtes douleur", "tatouage côtes", "flanc fait mal"]],
  ["douleur_sternum", "douleur", "douleur sternum", ["sternum fait mal", "tatouage sternum", "entre seins douleur"]],
  ["douleur_dos", "douleur", "douleur dos", ["tatouage dos", "dos fait mal", "douleur dos tattoo"]],
  ["douleur_colonne", "douleur", "douleur colonne", ["colonne tatouage", "dos colonne", "douleur colonne"]],
  ["douleur_omoplate", "douleur", "douleur omoplate", ["omoplate tatouage", "douleur omoplate", "tattoo omoplate"]],
  ["douleur_epaule", "douleur", "douleur épaule", ["épaule tatouage", "epaule douleur", "tattoo épaule"]],
  ["douleur_cuisse", "douleur", "douleur cuisse", ["cuisse tatouage", "douleur cuisse", "tattoo cuisse"]],
  ["douleur_mollet", "douleur", "douleur mollet", ["mollet tatouage", "douleur mollet", "tattoo mollet"]],
  ["douleur_genou", "douleur", "douleur genou", ["genou tatouage", "rotule tattoo", "douleur genou"]],
  ["douleur_cheville", "douleur", "douleur cheville", ["cheville tatouage", "douleur cheville", "tattoo cheville"]],
  ["douleur_pied", "douleur", "douleur pied", ["pied tatouage", "douleur pied", "tattoo pied"]],
  ["douleur_cou", "douleur", "douleur cou", ["cou tatouage", "gorge tattoo", "douleur cou"]],
  ["douleur_nuque", "douleur", "douleur nuque", ["nuque tatouage", "douleur nuque", "tattoo nuque"]],
  ["douleur_ventre", "douleur", "douleur ventre", ["ventre tatouage", "douleur ventre", "tattoo ventre"]],
  ["douleur_hanche", "douleur", "douleur hanche", ["hanche tatouage", "douleur hanche", "tattoo hanche"]],
  ["douleur_torse", "douleur", "douleur torse", ["torse tatouage", "douleur torse", "pec tattoo"]],
  ["creme_anesthesiante", "douleur", "crème anesthésiante", ["crème anesthésiante", "anesthésiant", "moins mal"]],
  ["pauses_seance", "douleur", "pauses pendant la séance", ["faire pause", "pause tatouage", "besoin pause"]],
  ["malaise_seance", "douleur", "malaise pendant séance", ["malaise tatouage", "tomber dans les pommes", "vertige"]],
  ["stress_avant_seance", "douleur", "stress avant séance", ["stress tatouage", "angoisse", "peur séance"]],
  ["peur_aiguilles", "douleur", "peur des aiguilles", ["peur aiguille", "aiguille tatouage", "phobie aiguille"]],
  ["preparation_generale", "préparation", "préparation générale", ["préparer séance", "avant tatouage", "quoi faire avant"]],
  ["manger_avant_seance", "préparation", "manger avant séance", ["manger avant", "venir à jeun", "repas tatouage"]],
  ["boire_avant_seance", "préparation", "boire avant séance", ["boire eau", "hydratation", "eau avant tattoo"]],
  ["alcool_avant_seance", "préparation", "alcool avant séance", ["alcool avant", "boire avant tatouage", "soirée veille"]],
  ["cafe_avant_seance", "préparation", "café avant séance", ["café avant", "cafeine", "boire café"]],
  ["sommeil_avant_seance", "préparation", "sommeil avant séance", ["dormir avant", "fatigue", "nuit avant tatouage"]],
  ["vetements_seance", "préparation", "vêtements séance", ["quoi porter", "tenue tatouage", "vêtement séance"]],
  ["raser_zone", "préparation", "raser la zone", ["raser avant", "poils tatouage", "épiler avant"]],
  ["hydrater_peau_avant", "préparation", "hydrater peau avant", ["hydrater peau", "peau sèche", "crème avant"]],
  ["sport_avant_seance", "préparation", "sport avant séance", ["sport avant", "muscu avant tatouage", "course avant"]],
  ["venir_malade", "contraintes santé", "venir malade", ["malade tatouage", "fièvre séance", "rhume tatouage"]],
  ["regles_et_tatouage", "contraintes santé", "règles et tatouage", ["règles tatouage", "menstruations", "cycle"]],
  ["grossesse_tatouage", "contraintes santé", "grossesse tatouage", ["enceinte tatouage", "grossesse", "tattoo enceinte"]],
  ["allaitement_tatouage", "contraintes santé", "allaitement tatouage", ["allaitement", "tattoo allaitement", "bébé"]],
  ["allergies_tatouage", "contraintes santé", "allergies tatouage", ["allergie encre", "allergies", "réaction allergique"]],
  ["peau_sensible", "contraintes santé", "peau sensible", ["peau fragile", "peau sensible", "réaction peau"]],
  ["eczema_tatouage", "contraintes santé", "eczéma tatouage", ["eczéma", "eczema", "plaque peau"]],
  ["psoriasis_tatouage", "contraintes santé", "psoriasis tatouage", ["psoriasis", "peau psoriasis", "plaque psoriasis"]],
  ["cicatrices_tatouage", "contraintes santé", "cicatrices tatouage", ["cicatrice", "tatouer cicatrice", "scar tattoo"]],
  ["grains_de_beaute", "contraintes santé", "grains de beauté", ["grain de beauté", "grain beaute", "tatouer grain"]],
  ["bronzage_avant", "préparation", "bronzage avant", ["bronzage avant", "peau bronzée", "uv avant"]],
  ["soleil_avant", "préparation", "soleil avant", ["soleil avant", "coup de soleil", "peau rouge"]],
  ["medicaments_avant", "contraintes santé", "médicaments avant", ["médicament", "traitement", "anticoagulant"]],
  ["anesthesiant_interdits", "douleur", "anesthésiant interdit", ["anesthésiant interdit", "crème interdite", "patch anesthésiant"]],
  ["preparation_grande_seance", "préparation", "préparation grande séance", ["longue séance", "grosse pièce", "préparer longue séance"]],
  ["prix_general", "prix", "prix général", ["prix tatouage", "tarif", "combien ça coûte"], ["prix", "tarif"], ["prix"], 5],
  ["devis_general", "devis", "devis général", ["devis", "demande devis", "estimation"], ["devis", "prix"], ["prix"], 5],
  ["acompte_reservation", "acompte", "acompte réservation", ["acompte", "arrhes", "bloquer rdv", "30 euros", "50 euros"], undefined, ["acompte"], 5],
  ["acompte_non_remboursable", "acompte", "acompte non remboursable", ["acompte non remboursable", "remboursement acompte", "acompte remboursé", "perdre acompte"], undefined, ["acompte"], 5],
  ["acompte_report_72h", "acompte", "acompte report 72h", ["72h", "72 heures", "changer date acompte", "report acompte", "déplacer rdv acompte"], undefined, ["acompte"], 5],
  ["acompte_deduit", "acompte", "acompte déduit", ["acompte déduit", "reste à payer", "prix final acompte", "payer le jour du rendez-vous"], undefined, ["acompte"]],
  ["paiement_moyens", "paiement", "moyens de paiement", ["paiement", "cb", "espèces", "virement"], undefined, ["prix"]],
  ["paiement_plusieurs_fois", "paiement", "paiement plusieurs fois", ["plusieurs fois", "payer en fois", "facilité paiement"], undefined, ["prix"]],
  ["prix_minimum", "prix", "prix minimum", ["minimum", "prix minimum", "petit prix"], undefined, ["prix"]],
  ["petit_tatouage_cher", "prix", "petit tatouage cher", ["petit tatouage cher", "pourquoi cher", "mini tattoo prix"], undefined, ["prix"]],
  ["taille_et_prix", "prix", "taille et prix", ["taille prix", "cm prix", "grand petit prix"], undefined, ["prix"]],
  ["placement_et_prix", "prix", "placement et prix", ["zone prix", "placement prix", "endroit tarif"], undefined, ["prix"]],
  ["detail_et_prix", "prix", "détail et prix", ["détails prix", "ombrage prix", "fine line prix"], undefined, ["prix"]],
  ["duree_et_prix", "prix", "durée et prix", ["durée prix", "temps prix", "heures tatouage"], undefined, ["prix"]],
  ["retouches_comprises", "retouches", "retouches comprises", ["retouche comprise", "retouches prix", "retouche incluse"], undefined, ["soins"]],
  ["annulation_rdv", "rendez-vous", "annulation rendez-vous", ["annuler rdv", "annulation", "pas venir"], undefined, ["rendez_vous", "acompte"]],
  ["deplacer_rdv", "rendez-vous", "déplacer rendez-vous", ["déplacer rdv", "reporter séance", "changer date"], undefined, ["rendez_vous", "acompte"]],
  ["retard_client", "rendez-vous", "retard client", ["retard", "en retard", "arriver tard"], undefined, ["rendez_vous"]],
  ["reservation_rdv", "rendez-vous", "réservation rendez-vous", ["réserver", "prendre rdv", "booker", "taille en cm", "photos de référence"], undefined, ["rendez_vous"], 4],
  ["disponibilites", "rendez-vous", "disponibilités", ["disponibilités", "créneau", "horaire", "dispo large"], undefined, ["rendez_vous"]],
  ["delai_attente", "rendez-vous", "délai attente", ["délai", "attente", "combien de temps réponse"], undefined, ["rendez_vous"]],
  ["formulaire_contact", "rendez-vous", "formulaire contact", ["formulaire", "contact", "envoyer demande"], undefined, ["rendez_vous"], 4],
  ["confirmation_rdv", "rendez-vous", "confirmation rendez-vous", ["confirmer rdv", "rdv confirmé", "validation créneau"], undefined, ["rendez_vous"]],
  ["projet_personnalise", "projet personnalisé", "projet personnalisé", ["sur mesure", "projet perso", "création"], undefined, ["style"]],
  ["envoyer_idees", "projet personnalisé", "envoyer idées", ["envoyer idée", "idée floue", "inspiration"], undefined, ["style"]],
  ["references_inspirations", "projet personnalisé", "références inspirations", ["références", "inspiration", "photo projet"], undefined, ["style"]],
  ["dessin_avant_seance", "projet personnalisé", "dessin avant séance", ["voir dessin", "dessin avant", "croquis"], undefined, ["style"]],
  ["validation_dessin", "projet personnalisé", "validation dessin", ["valider dessin", "validation", "accord dessin"], undefined, ["style"]],
  ["modification_dessin", "projet personnalisé", "modification dessin", ["modifier dessin", "changer dessin", "ajuster projet"], undefined, ["style"]],
  ["projet_refuse", "projet personnalisé", "projet refusé", ["projet refusé", "refus", "pas possible"], undefined, ["style"]],
  ["projet_pas_precis", "projet personnalisé", "projet pas précis", ["idée pas précise", "projet flou", "je sais pas"], undefined, ["style"]],
  ["choix_emplacement", "placements", "choix emplacement", ["choisir emplacement", "où tatouer", "placement"], undefined, ["vieillissement"]],
  ["choix_taille", "placements", "choix taille", ["choisir taille", "taille tatouage", "quelle taille"], undefined, ["vieillissement"]],
  ["flash_general", "flashs", "flash général", ["flash", "dessin dispo", "motif disponible"], undefined, ["flashs"], 4],
  ["reserver_flash", "flashs", "réserver flash", ["réserver flash", "prendre flash", "flash dispo"], undefined, ["flashs"]],
  ["modifier_flash", "flashs", "modifier flash", ["modifier flash", "changer flash", "adapter flash"], undefined, ["flashs"]],
  ["flash_unique", "flashs", "flash unique", ["flash unique", "exclusif", "une seule fois"], undefined, ["flashs"]],
  ["taille_flash", "flashs", "taille flash", ["taille flash", "agrandir flash", "réduire flash"], undefined, ["flashs"]],
  ["flash_disponible", "flashs", "flash disponible", ["flash disponible", "dispo flash", "encore libre"], undefined, ["flashs"]],
  ["flash_deja_pris", "flashs", "flash déjà pris", ["flash pris", "déjà réservé", "plus disponible"], undefined, ["flashs"]],
  ["flash_sur_mesure", "flashs", "flash sur mesure", ["flash sur mesure", "adapter flash", "flash perso"], undefined, ["flashs"]],
  ["manga_tattoo", "manga", "manga tattoo", ["manga tattoo", "tatouage manga", "manga"], undefined, ["style_manga"]],
  ["anime_tattoo", "anime", "anime tattoo", ["anime tattoo", "tatouage anime", "animé"], undefined, ["style_manga"]],
  ["personnage_manga", "manga", "personnage manga", ["personnage manga", "héros anime", "character"], undefined, ["style_manga"]],
  ["composition_manga", "manga", "composition manga", ["case manga", "composition manga", "panel manga"], undefined, ["style_manga"]],
  ["manga_floral", "manga", "manga floral", ["manga floral", "anime fleur", "personnage fleurs"], undefined, ["style_manga"]],
  ["blackwork", "blackwork", "blackwork", ["blackwork", "noir plein", "aplat noir"], undefined, ["style_blackwork"]],
  ["noir_et_gris", "blackwork", "noir et gris", ["noir et gris", "black and grey", "ombrage gris"], undefined, ["style_blackwork"]],
  ["tatouage_couleur", "projet personnalisé", "tatouage couleur", ["couleur", "tattoo couleur", "coloré"], undefined, ["style_couleur"]],
  ["fine_line", "fine line", "fine line", ["fine line", "ligne fine", "tatouage fin"], undefined, ["style_fine_line"]],
  ["dotwork", "dotwork", "dotwork", ["dotwork", "pointillisme", "points tattoo"], undefined, ["style"]],
  ["whip_shading", "whip shading", "whip shading", ["whip shading", "ombrage fouetté", "shading"], undefined, ["style"]],
  ["floral", "floral", "floral", ["floral", "fleur", "tatouage fleur"], undefined, ["style_floral"]],
  ["feuillage", "floral", "feuillage", ["feuillage", "feuille", "branche"], undefined, ["style_floral"]],
  ["mandala", "projet personnalisé", "mandala", ["mandala", "ornement", "symétrie"], undefined, ["style"]],
  ["lettrage", "projet personnalisé", "lettrage", ["lettrage", "phrase", "écriture"], undefined, ["style_lettrage"]],
  ["symboles", "projet personnalisé", "symboles", ["symbole", "signe", "petit symbole"], undefined, ["style"]],
  ["cover_general", "cover", "cover général", ["cover", "recouvrement", "couvrir tatouage"], undefined, ["cover"], 4],
  ["recouvrement_possible", "recouvrement", "recouvrement possible", ["possible cover", "recouvrir possible", "couvrir ancien"], undefined, ["cover"]],
  ["ancien_tatouage", "cover", "ancien tatouage", ["ancien tatouage", "vieux tattoo", "tatouage raté"], undefined, ["cover"]],
  ["tatouage_trop_fonce", "cover", "tatouage trop foncé", ["tatouage foncé", "trop noir", "ancien noir"], undefined, ["cover"]],
  ["laser_avant_cover", "cover", "laser avant cover", ["laser", "détatouage", "éclaircir"], undefined, ["cover"]],
  ["cover_manga", "cover", "cover manga", ["cover manga", "recouvrir manga", "manga cover"], undefined, ["cover"]],
  ["cover_floral", "cover", "cover floral", ["cover floral", "recouvrir avec fleur", "fleur cover"], undefined, ["cover"]],
  ["cicatrisation_generale", "cicatrisation", "cicatrisation générale", ["cicatrisation", "guérir", "combien temps cicatrise"], undefined, ["cicatrisation"]],
  ["soins_apres", "soins", "soins après", ["soins après", "après tatouage", "quoi faire après"], undefined, ["soins"], 4],
  ["nettoyage_tatouage", "soins", "nettoyage tatouage", ["nettoyer tatouage", "laver tattoo", "savon"], undefined, ["soins"]],
  ["creme_apres", "soins", "crème après", ["crème après", "creme tattoo", "mettre crème"], undefined, ["soins"]],
  ["film_protecteur", "soins", "film protecteur", ["film", "pansement", "seconde peau"], undefined, ["soins"]],
  ["demangeaisons", "cicatrisation", "démangeaisons", ["ça gratte", "démangeaison", "tatouage gratte"], undefined, ["cicatrisation"]],
  ["croutes", "cicatrisation", "croûtes", ["croûtes", "croute", "peau qui pèle"], undefined, ["cicatrisation"]],
  ["perte_encre", "cicatrisation", "perte encre", ["perte encre", "encre part", "trou tatouage"], undefined, ["cicatrisation"]],
  ["rougeur", "cicatrisation", "rougeur", ["rougeur", "tatouage rouge", "peau rouge"], undefined, ["cicatrisation"]],
  ["gonflement", "cicatrisation", "gonflement", ["gonflement", "tatouage gonflé", "gonfle"], undefined, ["cicatrisation"]],
  ["infection_suspicion", "sécurité", "suspicion infection", ["infection", "pus", "fièvre", "chaud"], undefined, ["securite"], 10],
  ["bain_apres", "soins", "bain après", ["bain après", "baignoire", "tremper"], undefined, ["soins"]],
  ["piscine_apres", "soins", "piscine après", ["piscine", "nager", "chlore"], undefined, ["soins"]],
  ["mer_apres", "soins", "mer après", ["mer", "plage", "eau salée"], undefined, ["soins"]],
  ["soleil_apres", "soins", "soleil après", ["soleil après", "exposition", "uv après"], undefined, ["soins"]],
  ["sport_apres", "soins", "sport après", ["sport après", "musculation après", "course après"], undefined, ["soins"]],
  ["vetements_apres", "soins", "vêtements après", ["vêtements après", "habit large", "frottement vêtement"], undefined, ["soins"]],
  ["dormir_tatouage", "soins", "dormir avec tatouage", ["dormir tatouage", "nuit après", "draps"], undefined, ["soins"]],
  ["travail_apres", "soins", "travail après tatouage", ["travail après", "bosser après", "retour travail"], undefined, ["soins"]],
  ["douche_apres", "soins", "douche après", ["douche après", "se laver", "eau douche"], undefined, ["soins"]],
  ["parfum_produits", "soins", "parfum produits", ["parfum", "produit parfumé", "gel douche"], undefined, ["soins"]],
  ["epilation_apres", "soins", "épilation après", ["épilation après", "raser après", "poils après"], undefined, ["soins"]],
  ["retouche_besoin", "retouches", "besoin retouche", ["retouche", "besoin retouche", "manque encre"], undefined, ["soins"]],
  ["retouche_delai", "retouches", "délai retouche", ["quand retouche", "délai retouche", "attendre retouche"], undefined, ["soins"]],
  ["retouche_prix", "retouches", "prix retouche", ["prix retouche", "retouche payante", "retouche comprise"], undefined, ["soins"]],
  ["vieillissement_general", "vieillissement", "vieillissement général", ["vieillissement", "vieillir", "tenir dans le temps"], undefined, ["vieillissement"]],
  ["tatouage_fin_vieillissement", "vieillissement", "vieillissement tatouage fin", ["fine line vieillit", "tatouage fin vieillit", "ligne fine temps"], undefined, ["vieillissement"]],
  ["lignes_trop_fines", "vieillissement", "lignes trop fines", ["trop fin", "ligne trop fine", "micro détail"], undefined, ["vieillissement"]],
  ["details_trop_petits", "vieillissement", "détails trop petits", ["détails petits", "trop petit", "mini détail"], undefined, ["vieillissement"]],
  ["entretien_long_terme", "vieillissement", "entretien long terme", ["entretien", "long terme", "hydrater longtemps"], undefined, ["vieillissement"]],
  ["protection_solaire_long_terme", "vieillissement", "protection solaire long terme", ["crème solaire", "spf tattoo", "protéger soleil"], undefined, ["vieillissement"]],
  ["accompagnant", "accompagnants", "accompagnant", ["venir accompagné", "ami avec moi", "accompagnant"], undefined, ["conversation"]],
  ["age_minimum", "mineurs", "âge minimum", ["âge minimum", "quel âge", "mineur âge"], undefined, ["securite"]],
  ["mineurs", "mineurs", "mineurs", ["mineur", "moins de 18", "autorisation parentale"], undefined, ["securite"]],
  ["carte_cadeau", "cartes cadeaux", "carte cadeau", ["carte cadeau", "bon cadeau", "offrir tatouage"], undefined, ["conversation"]],
  ["hygiene_studio", "hygiène", "hygiène studio", ["hygiène", "studio propre", "désinfection"], undefined, ["securite"]],
  ["materiel_sterile", "hygiène", "matériel stérile", ["matériel stérile", "sterile", "propre"], undefined, ["securite"]],
  ["aiguilles_usage_unique", "hygiène", "aiguilles usage unique", ["aiguille usage unique", "aiguille neuve", "aiguilles"], undefined, ["securite"]],
  ["tatouage_femme", "projet personnalisé", "tatouage femme", ["tatouage femme", "projet féminin", "tattoo femme"], undefined, ["style"]],
  ["tatouage_homme", "projet personnalisé", "tatouage homme", ["tatouage homme", "projet masculin", "tattoo homme"], undefined, ["style"]],
  ["tatouage_ete", "préparation", "tatouage été", ["tatouage été", "tattoo été", "soleil vacances"], undefined, ["preparation"]],
  ["tatouage_hiver", "préparation", "tatouage hiver", ["tatouage hiver", "tattoo hiver", "vêtement hiver"], undefined, ["preparation"]],
  ["transport_apres_seance", "soins", "transport après séance", ["transport après", "conduire après", "rentrer après"], undefined, ["soins"]],
  ["repas_apres_seance", "soins", "repas après séance", ["manger après", "repas après", "fatigue après"], undefined, ["soins"]],
  ["bonjour_bobot", "conversation", "bonjour Bobot", ["bonjour", "salut", "hello", "coucou"], ["bonjour", "salut"], ["conversation"], 10],
  ["merci_bobot", "conversation", "merci Bobot", ["merci", "merci beaucoup", "parfait merci"], ["merci"], ["conversation"], 9],
  ["qui_est_bobot", "conversation", "qui est Bobot", ["qui es tu", "bobot", "assistant tattoo"], ["présentation", "assistant"], ["conversation"], 9],
];

export const bobotTopics: BobotTopic[] = seedTuples.map(
  ([id, category, label, keywords, intents, answerKeys, priority]) =>
    makeTopic({
      id,
      category,
      label,
      keywords,
      intents,
      answerKeys: answerKeys ?? [answerKeyFor(id, category)],
      priority,
    }),
);

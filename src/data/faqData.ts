export type TattooFaqEntry = {
  id: string;
  category: string;
  keywords: string[];
  questions: string[];
  answers: string[];
};

type FaqTopic = {
  category: string;
  slug: string;
  label: string;
  keywords: string[];
  question: string;
  secondQuestion: string;
  guidance: string;
  customAnswers?: string[];
};

const studioFallback =
  "Chaque projet garde une part de cas par cas. Pour une réponse vraiment précise, Bryan a besoin de la zone, de la taille, du style, de quelques références et de ton idée générale via le formulaire de devis.";

const categoryIntroductions: Record<string, string> = {
  douleur:
    "La douleur dépend toujours de la zone, de la durée et de ta sensibilité, donc on parle plutôt de niveau de confort que de vérité absolue.",
  "préparation séance":
    "Une bonne préparation rend la séance plus fluide, plus confortable et plus simple à gérer pour toi comme pour le studio.",
  soins:
    "Les soins servent à accompagner la peau sans l'étouffer, avec des gestes simples, propres et réguliers.",
  cicatrisation:
    "La cicatrisation demande surtout de la patience, de l'hygiène et un peu de discipline pendant les premières semaines.",
  prix:
    "Le prix d'un tatouage reflète le temps, la complexité, la zone, la préparation du dessin et le niveau de précision demandé.",
  devis:
    "Un bon devis commence par une demande claire, parce que le studio ne peut pas estimer sérieusement un projet avec trois mots et aucune référence.",
  flashs:
    "Un flash est un dessin déjà préparé par Bryan, pensé pour garder une identité forte et être tatoué dans un cadre cohérent.",
  manga:
    "Pour un projet manga, l'objectif est de garder l'énergie du personnage ou de la scène tout en l'adaptant à la peau.",
  "projets personnalisés":
    "Un projet personnalisé se construit à partir de ton idée, mais aussi de la zone, du style et de la façon dont le dessin va vivre sur le corps.",
  cover:
    "Un cover demande plus d'analyse qu'un tatouage sur peau libre, parce qu'il faut composer avec l'ancien motif.",
  retouches:
    "Les retouches servent à ajuster un tatouage après cicatrisation, quand la peau a terminé la première phase de guérison.",
  "rendez-vous":
    "Le rendez-vous se prépare après étude du projet, pour éviter les créneaux mal cadrés ou les séances impossibles à tenir proprement.",
  acompte:
    "L'acompte sert à bloquer un créneau et à sécuriser le temps de préparation du projet.",
  hygiène:
    "L'hygiène est une base non négociable en tatouage: elle protège le client, l'artiste et la qualité du résultat.",
  sécurité:
    "La sécurité passe par des consignes claires, un espace propre et des décisions raisonnables avant, pendant et après la séance.",
  "premier tatouage":
    "Pour un premier tatouage, le plus important est de choisir un projet clair, une zone adaptée et un rythme confortable.",
  "tatouages fins":
    "Les tatouages fins demandent de la précision, mais aussi assez d'espace pour rester lisibles avec le temps.",
  blackwork:
    "Le blackwork repose sur le contraste, la lisibilité et une bonne gestion des aplats ou des masses noires.",
  "durée séance":
    "La durée d'une séance dépend du dessin, de la zone, du niveau de détail et du rythme nécessaire pour travailler proprement.",
  soleil:
    "Le soleil est l'un des grands ennemis d'un tatouage frais, puis l'un des facteurs qui peut accélérer le vieillissement d'un tatouage cicatrisé.",
  piscine:
    "La piscine, la mer et les bains sont à éviter pendant la cicatrisation parce que la peau a besoin d'un environnement propre et stable.",
  sport:
    "Le sport peut provoquer transpiration, frottements et tensions sur la peau, donc il faut l'adapter pendant la cicatrisation.",
  "alimentation avant séance":
    "Manger correctement avant une séance aide le corps à mieux tenir, surtout si le tatouage dure longtemps.",
  vêtements:
    "Les vêtements doivent faciliter l'accès à la zone et éviter les frottements inutiles après la séance.",
  accompagnants:
    "Venir accompagné peut être rassurant, mais l'espace de travail doit rester calme, propre et concentré.",
  annulation:
    "Une annulation ou un report doit être annoncé le plus tôt possible, parce qu'un créneau tattoo représente du temps réservé.",
  "modification projet":
    "Modifier un projet est possible quand c'est fait assez tôt et que cela reste cohérent avec la composition.",
  tailles:
    "La taille influence la lisibilité, le prix, la durée et le vieillissement du tatouage.",
  placements:
    "Le placement doit servir le dessin, suivre le corps et rester logique avec ton quotidien.",
  bras:
    "Le bras est une zone très demandée parce qu'elle offre de bons placements et une douleur souvent accessible.",
  main:
    "La main est une zone visible, mobile et technique, donc elle demande une vraie réflexion avant de se lancer.",
  côtes:
    "Les côtes sont une zone élégante mais souvent plus intense, avec une peau qui bouge beaucoup pendant la respiration.",
  jambe:
    "La jambe offre beaucoup de possibilités, du petit motif discret à la grande pièce plus construite.",
  sternum:
    "Le sternum est une zone forte visuellement, mais sensible et exigeante en placement.",
  cou:
    "Le cou est une zone très visible et sensible, donc elle demande un projet vraiment assumé.",
  conversation:
    "L'assistant B.Grumpy garde un ton simple, accueillant et utile, même pour les petits messages du quotidien.",
};

const topicGroups: Array<{
  category: string;
  topics: Array<{
    slug: string;
    label: string;
    keywords: string[];
    guidance: string;
    customAnswers?: string[];
  }>;
}> = [
  {
    category: "douleur",
    topics: [
      {
        slug: "bras",
        label: "douleur du bras",
        keywords: ["douleur bras", "bras fait mal", "avant bras douleur", "tatouage bras douleur"],
        guidance:
          "Le bras et l'avant-bras restent souvent parmi les zones les plus accessibles, même si l'intérieur du bras et le coude peuvent être plus sensibles.",
      },
      {
        slug: "cotes",
        label: "douleur des côtes",
        keywords: ["douleur cotes", "côtes douleur", "tatouage côtes", "cotes fait mal"],
        guidance:
          "Les côtes sont généralement plus intenses, car la peau est fine, proche des os et bouge avec la respiration.",
      },
      {
        slug: "main",
        label: "douleur de la main",
        keywords: ["douleur main", "tatouage main", "main fait mal", "doigts douleur"],
        guidance:
          "La main et les doigts peuvent être sensibles et techniques, avec une cicatrisation plus délicate à cause des mouvements et lavages fréquents.",
      },
      {
        slug: "sternum",
        label: "douleur du sternum",
        keywords: ["douleur sternum", "tatouage sternum", "sternum fait mal", "entre seins douleur"],
        guidance:
          "Le sternum est souvent une zone intense, surtout au centre, mais elle donne un rendu très fort quand le projet est bien placé.",
      },
      {
        slug: "jambe",
        label: "douleur de la jambe",
        keywords: ["douleur jambe", "mollet douleur", "cuisse douleur", "tatouage jambe"],
        guidance:
          "La cuisse est souvent confortable, le mollet peut être plus surprenant, et les zones proches du genou ou de la cheville montent en intensité.",
      },
      {
        slug: "premier",
        label: "douleur pour un premier tatouage",
        keywords: ["premier tatouage douleur", "peur douleur", "premiere fois mal", "premier tattoo"],
        guidance:
          "Pour débuter, mieux vaut choisir une zone accessible et une durée raisonnable, afin de découvrir la sensation sans pression inutile.",
      },
    ],
  },
  {
    category: "préparation séance",
    topics: [
      {
        slug: "veille",
        label: "préparation la veille",
        keywords: ["veille tatouage", "préparer séance", "avant rendez-vous", "avant tatouage"],
        guidance:
          "La veille, le mieux est de dormir correctement, de manger normalement, d'éviter l'alcool et de ne pas agresser la peau.",
      },
      {
        slug: "peau",
        label: "préparation de la peau",
        keywords: ["préparer peau", "hydrater peau", "peau sèche", "raser zone"],
        guidance:
          "Une peau hydratée les jours précédents se travaille mieux, mais il vaut mieux éviter d'appliquer une crème le jour même sans consigne.",
      },
      {
        slug: "documents",
        label: "documents et informations",
        keywords: ["documents tatouage", "infos séance", "quoi apporter", "carte identité"],
        guidance:
          "Il faut venir avec les informations utiles, être joignable, et prévoir de quoi confirmer ton identité si le studio le demande.",
      },
      {
        slug: "stress",
        label: "stress avant séance",
        keywords: ["stress tatouage", "angoisse séance", "peur tatouage", "rassurer"],
        guidance:
          "Le stress est normal, surtout pour un premier tattoo; bien comprendre le déroulé et arriver préparé aide beaucoup.",
      },
      {
        slug: "alcool",
        label: "alcool avant tatouage",
        keywords: [
          "alcool avant tatouage",
          "boire avant séance",
          "soirée veille",
          "alcool tattoo",
          "24h avant tatouage",
          "48h avant tatouage",
          "aspirine avant tatouage",
          "anti inflammatoire tatouage",
        ],
        guidance:
          "L'alcool et certains médicaments comme les anticoagulants, anti-inflammatoires ou aspirine sont à éviter dans les 24 à 48 heures avant la séance, car ils peuvent fluidifier le sang et compliquer le travail.",
      },
      {
        slug: "soleil",
        label: "soleil avant séance",
        keywords: ["soleil avant tatouage", "coup de soleil", "bronzage avant", "peau rouge"],
        guidance:
          "Une peau irritée ou brûlée par le soleil ne se tatoue pas dans de bonnes conditions; mieux vaut protéger la zone avant le rendez-vous.",
      },
    ],
  },
  {
    category: "soins",
    topics: [
      {
        slug: "nettoyage",
        label: "nettoyage du tatouage",
        keywords: ["nettoyer tatouage", "laver tatouage", "savon tatouage", "premier lavage"],
        guidance:
          "Le nettoyage doit être doux, avec des mains propres, sans frotter et en respectant les consignes données au studio.",
      },
      {
        slug: "creme",
        label: "crème de soin",
        keywords: ["crème tatouage", "creme soin", "mettre crème", "hydrater tatouage"],
        guidance:
          "La crème cicatrisante doit être appliquée en fine couche, en massant délicatement, 2 à 3 fois par jour; trop de produit peut étouffer la peau et ralentir une cicatrisation propre.",
      },
      {
        slug: "film",
        label: "film de protection",
        keywords: ["film tatouage", "pansement tatouage", "seconde peau", "retirer film"],
        guidance:
          "Après la séance, le film protecteur ne doit pas être gardé plus de 3 heures; les soins commencent au retrait du film et le tatouage doit ensuite rester à l'air libre pendant la cicatrisation.",
      },
      {
        slug: "grattage",
        label: "démangeaisons",
        keywords: ["tatouage gratte", "démangeaison tatouage", "gratter tatouage", "peau qui gratte"],
        guidance:
          "Les démangeaisons peuvent arriver pendant la cicatrisation, mais il ne faut pas gratter ni arracher les petites peaux.",
      },
      {
        slug: "rougeur",
        label: "rougeurs après tatouage",
        keywords: ["rougeur tatouage", "tatouage rouge", "peau chaude", "réaction tatouage"],
        guidance:
          "Une légère rougeur peut être normale au début, mais une douleur forte, une chaleur importante ou un gonflement inquiétant doit être surveillé sérieusement.",
      },
      {
        slug: "nuit",
        label: "dormir après tatouage",
        keywords: ["dormir tatouage", "nuit après tatouage", "drap tatouage", "sommeil tattoo"],
        guidance:
          "La première nuit, il faut éviter les frottements, dormir dans des draps propres et ne pas coller la zone fraîche contre une surface sale.",
      },
    ],
  },
  {
    category: "cicatrisation",
    topics: [
      {
        slug: "duree",
        label: "durée de cicatrisation",
        keywords: ["durée cicatrisation", "combien temps cicatrise", "tatouage guérit", "cicatrisation semaines"],
        guidance:
          "La cicatrisation complète se fait au bout d'environ 6 semaines, même si le tatouage paraît cicatrisé avant.",
      },
      {
        slug: "croutes",
        label: "croûtes et petites peaux",
        keywords: ["croûtes tatouage", "croute tatouage", "peau qui pèle", "tatouage pèle"],
        guidance:
          "Les petites peaux doivent tomber seules; les arracher peut abîmer le rendu ou créer des manques.",
      },
      {
        slug: "couleur",
        label: "tatouage qui ternit",
        keywords: ["tatouage terne", "couleur fade", "tattoo clair", "tatouage gris"],
        guidance:
          "Un tatouage peut sembler plus terne pendant certaines phases de cicatrisation; le rendu se juge mieux une fois la peau stabilisée.",
      },
      {
        slug: "gonflement",
        label: "gonflement",
        keywords: ["tatouage gonflé", "gonflement tatouage", "peau gonflée", "zone gonflée"],
        guidance:
          "Un léger gonflement peut arriver selon la zone, mais s'il devient important, douloureux ou inquiétant, il faut demander un avis médical.",
      },
      {
        slug: "infection",
        label: "signe inquiétant",
        keywords: ["infection tatouage", "pus tatouage", "fièvre tatouage", "douleur anormale"],
        guidance:
          "En cas de fièvre, pus, douleur qui augmente, rougeur qui s'étend ou chaleur importante, il faut contacter rapidement un professionnel de santé.",
      },
      {
        slug: "retour-normal",
        label: "retour à la normale",
        keywords: ["peau normale", "tatouage stabilisé", "fin cicatrisation", "tatouage guéri"],
        guidance:
          "Le retour à un aspect stable se fait progressivement; mieux vaut attendre la fin de cicatrisation avant de juger un détail ou une retouche.",
      },
    ],
  },
  {
    category: "prix",
    topics: [
      {
        slug: "calcul",
        label: "calcul du prix",
        keywords: ["prix tatouage", "calcul prix", "tarif tatouage", "combien coûte"],
        guidance:
          "Le prix dépend de la taille, du placement, du détail, du style, du temps de dessin et de la durée prévue en séance.",
      },
      {
        slug: "minimum",
        label: "tarif minimum",
        keywords: ["prix minimum", "petit tatouage prix", "minimum tattoo", "tarif minimum"],
        guidance:
          "Même un petit tatouage demande du temps, du matériel, de l'installation et de l'hygiène; il existe donc toujours un minimum de cohérence tarifaire.",
      },
      {
        slug: "taille",
        label: "prix selon la taille",
        keywords: ["prix taille", "prix cm", "tatouage 10 cm", "petit grand prix"],
        guidance:
          "La taille aide à estimer, mais elle ne suffit pas; un petit dessin très détaillé peut demander plus de temps qu'un motif plus grand et simple.",
      },
      {
        slug: "detail",
        label: "prix selon détail",
        keywords: ["prix détail", "tatouage détaillé", "ombres prix", "finesse prix"],
        guidance:
          "Les détails, textures, ombrages et lignes fines augmentent le temps de travail et donc l'estimation.",
      },
      {
        slug: "zone",
        label: "prix selon la zone",
        keywords: ["prix zone", "emplacement prix", "zone difficile prix", "placement tarif"],
        guidance:
          "Une zone difficile, mobile ou sensible peut prendre plus de temps, car l'installation et le rythme de travail changent.",
      },
      {
        slug: "budget",
        label: "budget client",
        keywords: ["budget tatouage", "budget maximum", "j'ai un budget", "adapter budget"],
        guidance:
          "Un budget aide à cadrer le projet; Bryan peut parfois adapter la taille ou le niveau de détail pour rester cohérent.",
      },
    ],
  },
  {
    category: "devis",
    topics: [
      {
        slug: "infos",
        label: "informations pour devis",
        keywords: ["infos devis", "demande devis", "quoi mettre devis", "faire devis"],
        guidance:
          "Pour un devis, il faut la zone, la taille, le style, les références, le budget, les disponibilités et une description claire.",
      },
      {
        slug: "references",
        label: "références visuelles",
        keywords: ["références devis", "photos références", "images inspiration", "envoyer photo"],
        guidance:
          "Les références servent à comprendre l'ambiance, la composition, le niveau de détail et ce que tu veux éviter.",
      },
      {
        slug: "delai",
        label: "délai de réponse",
        keywords: ["réponse devis", "délai devis", "combien temps réponse", "attente devis"],
        guidance:
          "Le délai dépend du nombre de demandes et de la complexité du projet; un devis sérieux demande une vraie lecture.",
      },
      {
        slug: "refus",
        label: "projet refusé",
        keywords: ["projet refusé", "refus devis", "tatoueur refuse", "pas accepté"],
        guidance:
          "Un projet peut être refusé s'il n'est pas cohérent avec le style, la faisabilité, l'éthique ou les conditions de travail du studio.",
      },
      {
        slug: "precision",
        label: "devis précis",
        keywords: ["devis précis", "prix exact", "estimation exacte", "tarif précis"],
        guidance:
          "Plus la demande est complète, plus l'estimation peut être fiable; sans taille ou placement, le prix reste forcément approximatif.",
      },
      {
        slug: "formulaire",
        label: "formulaire de devis",
        keywords: ["formulaire devis", "envoyer formulaire", "page devis", "contacter bryan"],
        guidance:
          "Le formulaire est le meilleur chemin pour centraliser les informations et éviter les échanges incomplets.",
      },
    ],
  },
  {
    category: "flashs",
    topics: [
      {
        slug: "definition",
        label: "définition d'un flash",
        keywords: ["c'est quoi flash", "flash tatouage", "définition flash", "dessin flash"],
        guidance:
          "Un flash est un dessin déjà préparé, disponible à tatouer dans l'univers du studio.",
      },
      {
        slug: "reservation",
        label: "réserver un flash",
        keywords: ["réserver flash", "flash disponible", "prendre flash", "flash réservé"],
        guidance:
          "Un flash se demande via le formulaire ou le contact prévu; il faut confirmer la zone, la taille et la disponibilité.",
      },
      {
        slug: "modification",
        label: "modifier un flash",
        keywords: ["modifier flash", "changer flash", "adapter flash", "personnaliser flash"],
        guidance:
          "Certains ajustements sont possibles, mais il faut garder l'esprit du dessin; une grosse modification devient plutôt un projet sur mesure.",
      },
      {
        slug: "taille",
        label: "taille d'un flash",
        keywords: ["taille flash", "agrandir flash", "réduire flash", "flash petit"],
        guidance:
          "La taille peut souvent être ajustée, tant que le dessin reste lisible et que les détails ne deviennent pas trop serrés.",
      },
      {
        slug: "couleur",
        label: "couleur sur flash",
        keywords: ["flash couleur", "ajouter couleur", "changer couleur", "flash noir"],
        guidance:
          "La couleur dépend du dessin et du style; elle peut être envisagée si elle sert le motif sans le déséquilibrer.",
      },
      {
        slug: "unique",
        label: "flash unique",
        keywords: ["flash unique", "flash plusieurs fois", "exclusif flash", "même flash"],
        guidance:
          "Certains flashs peuvent être uniques ou adaptés selon la logique du studio; il faut demander au moment de la réservation.",
      },
    ],
  },
  {
    category: "manga",
    topics: [
      {
        slug: "personnage",
        label: "personnage manga",
        keywords: ["tatouage manga", "personnage manga", "anime tattoo", "manga personnage"],
        guidance:
          "Un personnage manga doit être simplifié intelligemment pour rester lisible sur la peau, surtout si la taille est limitée.",
      },
      {
        slug: "case",
        label: "case manga",
        keywords: ["case manga", "panel manga", "scène manga", "planche manga"],
        guidance:
          "Une case manga peut très bien fonctionner, mais il faut choisir une composition lisible et éviter trop de micro-détails.",
      },
      {
        slug: "texte",
        label: "texte japonais",
        keywords: ["texte japonais", "kanji", "phrase manga", "écriture japonaise"],
        guidance:
          "Pour du texte japonais, il faut vérifier la traduction et la lisibilité; le studio évite les symboles posés au hasard.",
      },
      {
        slug: "noir-gris",
        label: "manga noir et gris",
        keywords: ["manga noir gris", "manga blackwork", "trame manga", "ombrage manga"],
        guidance:
          "Le noir et gris convient bien au manga, surtout avec des contrastes propres et une trame adaptée au tatouage.",
      },
      {
        slug: "couleur",
        label: "manga couleur",
        keywords: ["manga couleur", "anime couleur", "couleur personnage", "tattoo anime couleur"],
        guidance:
          "La couleur peut donner beaucoup d'impact, mais il faut penser contraste, vieillissement et cohérence avec le style de Bryan.",
      },
      {
        slug: "reference",
        label: "référence manga",
        keywords: ["référence manga", "image manga", "screenshot anime", "envoyer manga"],
        guidance:
          "Plus la référence est nette, plus il est facile d'adapter correctement le personnage ou la scène en tatouage.",
      },
    ],
  },
  {
    category: "projets personnalisés",
    topics: [
      {
        slug: "idee",
        label: "idée de départ",
        keywords: ["idée tatouage", "projet perso", "projet personnalisé", "création tatouage"],
        guidance:
          "Une idée de départ peut être simple; Bryan la transforme en projet cohérent grâce aux références, à la zone et au style voulu.",
      },
      {
        slug: "composition",
        label: "composition du dessin",
        keywords: ["composition tatouage", "assembler idées", "plusieurs éléments", "dessin personnalisé"],
        guidance:
          "Quand plusieurs éléments sont demandés, il faut hiérarchiser pour éviter un dessin trop chargé ou confus.",
      },
      {
        slug: "style",
        label: "choix du style",
        keywords: ["style tatouage", "quel style", "style bryan", "univers tattoo"],
        guidance:
          "Le projet fonctionne mieux quand il respecte l'univers du tatoueur au lieu de mélanger trop de directions différentes.",
      },
      {
        slug: "dessin",
        label: "préparation du dessin",
        keywords: ["dessin avant séance", "voir dessin", "croquis tatouage", "préparer dessin"],
        guidance:
          "Le dessin demande du temps de préparation; les échanges servent à cadrer avant de finaliser la pièce.",
      },
      {
        slug: "symbolique",
        label: "symbolique personnelle",
        keywords: ["symbolique tatouage", "tatouage signification", "histoire personnelle", "sens tatouage"],
        guidance:
          "La symbolique est importante, mais elle doit aussi devenir un dessin lisible et esthétique sur la peau.",
      },
      {
        slug: "liberte",
        label: "liberté artistique",
        keywords: ["laisser liberté", "carte blanche", "faire confiance", "liberté tatoueur"],
        guidance:
          "Laisser une part de liberté à Bryan aide souvent à obtenir un résultat plus cohérent et plus vivant.",
      },
    ],
  },
  {
    category: "cover",
    topics: [
      {
        slug: "possible",
        label: "cover possible",
        keywords: ["cover possible", "recouvrir tatouage", "cacher ancien tatouage", "cover tattoo"],
        guidance:
          "Un cover est possible selon la taille, la couleur, la densité et l'emplacement de l'ancien tatouage.",
      },
      {
        slug: "noir",
        label: "recouvrir du noir",
        keywords: ["recouvrir noir", "ancien tatouage noir", "cover noir", "tatouage foncé"],
        guidance:
          "Un tatouage très noir limite les possibilités; il faut souvent prévoir un motif plus dense ou une composition adaptée.",
      },
      {
        slug: "couleur",
        label: "recouvrir couleur",
        keywords: ["recouvrir couleur", "cover couleur", "ancien tattoo couleur", "tatouage coloré"],
        guidance:
          "La couleur influence le cover; certaines teintes se couvrent mieux que d'autres selon la saturation.",
      },
      {
        slug: "laser",
        label: "laser avant cover",
        keywords: ["laser cover", "détatouage avant cover", "éclaircir tatouage", "laser tatouage"],
        guidance:
          "Un passage laser peut parfois ouvrir plus d'options, surtout si l'ancien tatouage est très sombre.",
      },
      {
        slug: "taille",
        label: "taille d'un cover",
        keywords: ["taille cover", "cover plus grand", "recouvrir petit", "grand cover"],
        guidance:
          "Un cover doit souvent être plus grand que l'ancien tatouage pour intégrer correctement les formes à cacher.",
      },
      {
        slug: "analyse",
        label: "analyse avant cover",
        keywords: ["photo cover", "analyse cover", "avis cover", "envoyer ancien tatouage"],
        guidance:
          "Pour analyser un cover, il faut une photo nette de l'ancien tatouage, la zone et une idée du style souhaité.",
      },
    ],
  },
  {
    category: "retouches",
    topics: [
      {
        slug: "besoin",
        label: "besoin de retouche",
        keywords: ["retouche tatouage", "besoin retouche", "manque encre", "tatouage clair"],
        guidance:
          "Une retouche se juge après cicatrisation complète, pas pendant la phase où la peau pèle ou semble terne.",
      },
      {
        slug: "delai",
        label: "délai de retouche",
        keywords: ["quand retouche", "délai retouche", "attendre retouche", "retouche après cicatrisation"],
        guidance:
          "Il faut attendre que la peau soit stabilisée avant de retoucher, souvent plusieurs semaines selon la cicatrisation.",
      },
      {
        slug: "cause",
        label: "pourquoi retoucher",
        keywords: ["pourquoi retouche", "encre partie", "tatouage a sauté", "perte encre"],
        guidance:
          "Une retouche peut venir d'une zone qui cicatrise différemment, d'un frottement, d'un soin compliqué ou d'une réaction de peau.",
      },
      {
        slug: "ancien",
        label: "retoucher ancien tattoo",
        keywords: ["retoucher ancien", "raviver tatouage", "ancien tatouage fade", "rafraîchir tattoo"],
        guidance:
          "Rafraîchir un ancien tatouage peut être possible, mais il faut voir l'état actuel, les lignes et la saturation.",
      },
      {
        slug: "fine-line",
        label: "retouche fine line",
        keywords: ["retouche fine line", "ligne fine partie", "tatouage fin clair", "fine line retouche"],
        guidance:
          "Les lignes fines peuvent nécessiter une retouche selon la zone et la cicatrisation, car elles laissent moins de marge.",
      },
      {
        slug: "demande",
        label: "demander une retouche",
        keywords: ["demander retouche", "prendre rdv retouche", "photo retouche", "contacter retouche"],
        guidance:
          "Pour demander une retouche, le mieux est d'envoyer une photo nette en lumière naturelle et d'expliquer ce qui te gêne.",
      },
    ],
  },
  {
    category: "rendez-vous",
    topics: [
      {
        slug: "prendre",
        label: "prendre rendez-vous",
        keywords: ["prendre rendez-vous", "prendre rdv", "réserver séance", "date tattoo"],
        guidance:
          "Le rendez-vous se prend après validation du projet, de l'estimation et des disponibilités; pour un devis, il faut un projet détaillé, des photos de référence, la zone, une taille en centimètres et des disponibilités assez larges.",
      },
      {
        slug: "disponibilites",
        label: "disponibilités",
        keywords: ["disponibilités", "créneau", "horaire", "jour disponible"],
        guidance:
          "Donner des disponibilités larges facilite beaucoup la prise de rendez-vous et évite les échanges interminables.",
      },
      {
        slug: "retard",
        label: "retard au rendez-vous",
        keywords: ["retard rdv", "en retard", "retard séance", "arriver tard"],
        guidance:
          "En cas de retard, il faut prévenir rapidement; un gros retard peut réduire la séance ou obliger à reporter.",
      },
      {
        slug: "confirmation",
        label: "confirmation du rendez-vous",
        keywords: ["confirmer rendez-vous", "confirmation rdv", "rdv confirmé", "valider créneau"],
        guidance:
          "Un créneau est vraiment sécurisé quand les conditions demandées par le studio sont validées.",
      },
      {
        slug: "prevoir",
        label: "temps à prévoir",
        keywords: ["temps rendez-vous", "prévoir combien", "durée rdv", "combien de temps sur place"],
        guidance:
          "Il faut prévoir plus que le temps de tatouage pur: accueil, placement, stencil, pauses et consignes de soin.",
      },
      {
        slug: "sans-rdv",
        label: "venir sans rendez-vous",
        keywords: ["sans rendez-vous", "venir directement", "walk in", "passer au studio"],
        guidance:
          "Le fonctionnement dépend du studio; pour un projet sérieux, il vaut mieux passer par une demande plutôt que venir au hasard.",
      },
    ],
  },
  {
    category: "acompte",
    topics: [
      {
        slug: "utilite",
        label: "utilité de l'acompte",
        keywords: ["acompte tatouage", "pourquoi acompte", "arrhes tattoo", "bloquer rdv"],
        guidance:
          "Un acompte de 30 € ou 50 € peut être demandé pour bloquer un rendez-vous, avec un acompte par projet ou date réservée; il protège aussi les échanges et le temps de préparation du projet.",
      },
      {
        slug: "remboursement",
        label: "remboursement acompte",
        keywords: ["remboursement acompte", "acompte remboursé", "annuler acompte", "perdre acompte"],
        guidance:
          "L'acompte n'est pas remboursable, quelle que soit la raison; il est perdu en cas d'annulation définitive, de changement complet du projet initial ou de changement de date moins de 72 heures avant le rendez-vous.",
      },
      {
        slug: "report",
        label: "report avec acompte",
        keywords: ["report acompte", "déplacer rdv", "changer date acompte", "reporter séance"],
        guidance:
          "Si le changement de date est demandé plus de 72 heures avant le rendez-vous, l'acompte est conservé pour la nouvelle date; sous 72 heures, il est perdu et doit être payé de nouveau.",
      },
      {
        slug: "montant",
        label: "montant acompte",
        keywords: ["montant acompte", "combien acompte", "prix acompte", "acompte combien"],
        guidance:
          "Le montant demandé est généralement de 30 € ou 50 €, selon le projet ou la date réservée.",
      },
      {
        slug: "deduction",
        label: "acompte déduit",
        keywords: ["acompte déduit", "acompte prix final", "arrhes déduites", "payer reste"],
        guidance:
          "L'acompte est déduit du prix final; le reste est à payer le jour du rendez-vous.",
      },
      {
        slug: "dessin",
        label: "acompte et dessin",
        keywords: ["acompte dessin", "dessin avant acompte", "payer dessin", "préparation dessin"],
        guidance:
          "Pour du sur mesure, l'acompte rémunère aussi la prise de rendez-vous, la discussion autour du projet et le travail de préparation; le dessin peut être envoyé la veille, mais le travail commence dès la prise de rendez-vous.",
      },
    ],
  },
  {
    category: "hygiène",
    topics: [
      {
        slug: "materiel",
        label: "matériel stérile",
        keywords: ["matériel stérile", "aiguille stérile", "hygiène matériel", "aiguille neuve"],
        guidance:
          "Le matériel en contact direct doit être stérile, à usage unique quand nécessaire, et manipulé dans des conditions propres.",
      },
      {
        slug: "gants",
        label: "gants",
        keywords: ["gants tatoueur", "changer gants", "hygiène gants", "gants tattoo"],
        guidance:
          "Les gants servent à éviter les contaminations croisées et doivent être changés dès que la situation l'exige.",
      },
      {
        slug: "surface",
        label: "surface de travail",
        keywords: ["surface propre", "poste tatouage", "désinfection poste", "hygiène studio"],
        guidance:
          "Le poste de travail doit être préparé, protégé et nettoyé pour limiter les risques.",
      },
      {
        slug: "client",
        label: "hygiène client",
        keywords: ["hygiène client", "venir propre", "douche avant", "propreté séance"],
        guidance:
          "Venir propre et avec des vêtements adaptés participe aussi à de bonnes conditions de séance.",
      },
      {
        slug: "animaux",
        label: "animaux au studio",
        keywords: ["animal studio", "chien studio", "hygiène animal", "venir avec chien"],
        guidance:
          "Les animaux ne sont généralement pas compatibles avec une zone de travail tattoo propre et concentrée.",
      },
      {
        slug: "maladie",
        label: "malade le jour J",
        keywords: ["malade tatouage", "fièvre séance", "rhume tatouage", "venir malade"],
        guidance:
          "Si tu es malade, fiévreux ou vraiment affaibli, il vaut mieux prévenir le studio et voir s'il faut reporter.",
      },
    ],
  },
  {
    category: "sécurité",
    topics: [
      {
        slug: "mineur",
        label: "tatouage mineur",
        keywords: ["mineur tatouage", "moins de 18 ans", "autorisation parentale", "tatouer mineur"],
        guidance:
          "Les conditions pour les mineurs sont strictes et le studio peut refuser selon le projet, l'âge et le cadre légal.",
      },
      {
        slug: "grossesse",
        label: "grossesse",
        keywords: ["grossesse tatouage", "enceinte tattoo", "tatouage enceinte", "allaitement tatouage"],
        guidance:
          "Pendant une grossesse ou une période sensible, il vaut mieux demander un avis médical et reporter le tatouage si nécessaire.",
      },
      {
        slug: "traitement",
        label: "traitement médical",
        keywords: ["traitement médical", "anticoagulant", "médicament tatouage", "maladie peau"],
        guidance:
          "Certains traitements ou problèmes de peau peuvent influencer la séance; il faut le signaler et demander un avis médical en cas de doute.",
      },
      {
        slug: "allergie",
        label: "allergies",
        keywords: ["allergie tatouage", "allergie encre", "réaction allergique", "peau allergique"],
        guidance:
          "Si tu as des allergies connues ou des réactions cutanées fortes, il faut le signaler avant la séance.",
      },
      {
        slug: "malaise",
        label: "malaise",
        keywords: ["malaise tatouage", "tomber dans les pommes", "vertige séance", "faiblesse tattoo"],
        guidance:
          "Manger avant, être reposé et prévenir quand tu ne te sens pas bien aide à éviter ou gérer un malaise.",
      },
      {
        slug: "consentement",
        label: "consentement",
        keywords: ["consentement tatouage", "être sûr", "hésitation tatouage", "regret"],
        guidance:
          "Un tatouage doit être choisi sans pression; si tu hésites fortement, mieux vaut ralentir plutôt que te précipiter.",
      },
    ],
  },
  {
    category: "premier tatouage",
    topics: [
      {
        slug: "zone",
        label: "zone pour débuter",
        keywords: ["premier tatouage zone", "où faire premier", "zone facile premier", "débuter tatouage"],
        guidance:
          "Pour un premier tatouage, une zone accessible comme l'avant-bras, le bras ou la cuisse peut être plus confortable.",
      },
      {
        slug: "taille",
        label: "taille premier tatouage",
        keywords: ["taille premier tatouage", "petit premier tattoo", "grand premier", "premier tatouage petit"],
        guidance:
          "Un premier tatouage peut être petit ou plus ambitieux, mais il doit rester cohérent avec ta tolérance et ton envie réelle.",
      },
      {
        slug: "peur",
        label: "peur du premier",
        keywords: ["peur premier tatouage", "stress premier", "angoisse premier tattoo", "rassurer premier"],
        guidance:
          "La peur est normale; poser les questions avant la séance permet de transformer l'inconnu en quelque chose de beaucoup plus gérable.",
      },
      {
        slug: "choix",
        label: "choisir motif premier",
        keywords: ["choisir premier tatouage", "idée premier tattoo", "motif premier", "premier motif"],
        guidance:
          "Pour un premier motif, vise quelque chose que tu comprends vraiment, pas juste une tendance vue trop vite.",
      },
      {
        slug: "visibilite",
        label: "visibilité premier tatouage",
        keywords: ["premier tatouage visible", "tatouage discret", "cacher tatouage", "visible travail"],
        guidance:
          "Pour un premier tattoo, réfléchir à la visibilité aide à éviter une décision trop rapide sur une zone très exposée.",
      },
      {
        slug: "questions",
        label: "questions avant premier",
        keywords: ["questions premier tatouage", "avant premier tattoo", "savoir avant", "conseil débutant"],
        guidance:
          "Il n'y a pas de mauvaise question avant un premier tatouage; mieux vaut demander que rester avec un doute.",
      },
    ],
  },
  {
    category: "tatouages fins",
    topics: [
      {
        slug: "vieillissement",
        label: "vieillissement fine line",
        keywords: ["fine line vieillit", "tatouage fin vieillissement", "ligne fine", "tatouage fin"],
        guidance:
          "Un tatouage fin peut très bien vieillir s'il est assez lisible, bien placé et pas trop miniaturisé.",
      },
      {
        slug: "taille",
        label: "taille fine line",
        keywords: ["taille fine line", "petit tatouage fin", "mini tatouage", "micro tattoo"],
        guidance:
          "Trop réduire un dessin fin peut nuire à sa lisibilité; il faut laisser respirer les détails.",
      },
      {
        slug: "zone",
        label: "zone fine line",
        keywords: ["zone fine line", "où faire tatouage fin", "placement fin", "tatouage discret"],
        guidance:
          "Les zones très mobiles ou exposées aux frottements peuvent être moins idéales pour des lignes très fines.",
      },
      {
        slug: "douleur",
        label: "douleur fine line",
        keywords: ["douleur fine line", "tatouage fin fait mal", "ligne fine douleur", "petit tattoo mal"],
        guidance:
          "Un tatouage fin est souvent plus rapide, mais la sensation dépend surtout de la zone.",
      },
      {
        slug: "retouche",
        label: "retouche fine line",
        keywords: ["retouche tatouage fin", "fine line retouche", "ligne fine partie", "trait fin clair"],
        guidance:
          "Les lignes fines peuvent parfois demander une petite retouche après cicatrisation selon la peau et la zone.",
      },
      {
        slug: "style",
        label: "style fine line",
        keywords: ["style fin", "tatouage minimaliste", "tatouage délicat", "trait léger"],
        guidance:
          "Le style fin doit rester élégant sans devenir trop fragile techniquement.",
      },
    ],
  },
  {
    category: "blackwork",
    topics: [
      {
        slug: "definition",
        label: "définition blackwork",
        keywords: ["blackwork", "tatouage noir", "style blackwork", "aplats noirs"],
        guidance:
          "Le blackwork utilise le noir comme élément principal, avec des contrastes forts, des masses ou des lignes assumées.",
      },
      {
        slug: "aplats",
        label: "aplats noirs",
        keywords: ["aplat noir", "remplissage noir", "gros noir tattoo", "noir plein"],
        guidance:
          "Les aplats demandent du temps, de la régularité et une bonne gestion de la peau.",
      },
      {
        slug: "douleur",
        label: "douleur blackwork",
        keywords: ["blackwork douleur", "aplat douleur", "remplissage mal", "tatouage noir douleur"],
        guidance:
          "Le blackwork peut être plus fatigant si la séance contient beaucoup de remplissage.",
      },
      {
        slug: "vieillissement",
        label: "vieillissement blackwork",
        keywords: ["blackwork vieillit", "noir vieillit", "tatouage noir durée", "contraste vieillissement"],
        guidance:
          "Un blackwork bien construit garde souvent une bonne force visuelle grâce au contraste.",
      },
      {
        slug: "cover",
        label: "blackwork et cover",
        keywords: ["blackwork cover", "cover noir", "recouvrir blackwork", "tatouage noir cover"],
        guidance:
          "Le blackwork peut être une solution pour certains covers, mais il doit rester esthétique et pas seulement cacher.",
      },
      {
        slug: "details",
        label: "détails en blackwork",
        keywords: ["détails blackwork", "ornement noir", "motif noir", "texture noire"],
        guidance:
          "Même en noir, il faut garder une hiérarchie claire entre les détails, les masses et les respirations.",
      },
    ],
  },
  {
    category: "durée séance",
    topics: [
      {
        slug: "petit",
        label: "durée petit tatouage",
        keywords: ["durée petit tatouage", "temps petit tattoo", "petit tatouage combien", "séance courte"],
        guidance:
          "Un petit tatouage peut être rapide, mais il faut compter l'installation, le stencil, les échanges et les soins.",
      },
      {
        slug: "grand",
        label: "durée grande pièce",
        keywords: ["durée grand tatouage", "grosse pièce temps", "longue séance", "plusieurs heures"],
        guidance:
          "Une grande pièce peut demander plusieurs heures ou plusieurs séances selon le détail et l'endurance.",
      },
      {
        slug: "pauses",
        label: "pauses pendant séance",
        keywords: ["pause tatouage", "faire pause", "besoin pause", "pause séance"],
        guidance:
          "Les pauses sont normales, surtout sur les longues séances; elles permettent de garder un bon rythme.",
      },
      {
        slug: "stencil",
        label: "temps de stencil",
        keywords: ["stencil temps", "placement stencil", "calque tatouage", "préparation stencil"],
        guidance:
          "Le placement du stencil fait partie de la séance et peut prendre du temps pour être juste.",
      },
      {
        slug: "detail",
        label: "détail et durée",
        keywords: ["détail durée", "tatouage détaillé temps", "ombre temps", "texture temps"],
        guidance:
          "Plus le dessin est détaillé, plus la séance demande de patience et de précision.",
      },
      {
        slug: "plusieurs",
        label: "plusieurs séances",
        keywords: ["plusieurs séances", "tatouage en deux fois", "séance multiple", "continuer tatouage"],
        guidance:
          "Diviser un projet en plusieurs séances peut être plus propre et plus confortable pour les grosses pièces.",
      },
    ],
  },
  {
    category: "soleil",
    topics: [
      {
        slug: "avant",
        label: "soleil avant tatouage",
        keywords: ["soleil avant", "bronzage avant tatouage", "coup de soleil avant", "peau bronzée"],
        guidance:
          "Une peau brûlée ou irritée par le soleil n'est pas idéale à tatouer; il faut protéger la zone avant la séance.",
      },
      {
        slug: "apres",
        label: "soleil après tatouage",
        keywords: ["soleil après", "tatouage soleil", "exposition après tattoo", "soleil cicatrisation"],
        guidance:
          "Le soleil est à éviter pendant la cicatrisation, car la peau est fraîche et plus vulnérable.",
      },
      {
        slug: "creme-solaire",
        label: "crème solaire",
        keywords: ["crème solaire tatouage", "protéger tatouage soleil", "spf tattoo", "écran solaire"],
        guidance:
          "Une fois cicatrisé, protéger le tatouage avec une bonne protection solaire aide à préserver le contraste.",
      },
      {
        slug: "vacances",
        label: "tatouage avant vacances",
        keywords: ["tatouage avant vacances", "vacances soleil", "tattoo été", "partir au soleil"],
        guidance:
          "Se faire tatouer juste avant des vacances au soleil ou à la mer est rarement idéal.",
      },
      {
        slug: "bronzage",
        label: "bronzage",
        keywords: ["bronzage tatouage", "tatouage bronzé", "uv tatouage", "cabine uv"],
        guidance:
          "Le bronzage et les UV peuvent fatiguer la peau et ternir le tatouage avec le temps.",
      },
      {
        slug: "ancien",
        label: "soleil sur ancien tatouage",
        keywords: ["ancien tatouage soleil", "tatouage cicatrisé soleil", "soleil tattoo ancien", "couleur soleil"],
        guidance:
          "Même cicatrisé, un tatouage exposé souvent au soleil vieillit généralement plus vite.",
      },
    ],
  },
  {
    category: "piscine",
    topics: [
      {
        slug: "apres",
        label: "piscine après tatouage",
        keywords: ["piscine après tatouage", "baignade tattoo", "nager après", "piscine cicatrisation"],
        guidance:
          "La piscine est à éviter pendant la cicatrisation pour limiter les risques d'irritation ou de contamination.",
      },
      {
        slug: "mer",
        label: "mer après tatouage",
        keywords: ["mer après tatouage", "eau salée tattoo", "plage tatouage", "baignade mer"],
        guidance:
          "La mer est aussi à éviter au début, même si elle paraît naturelle, car la peau fraîche doit rester protégée.",
      },
      {
        slug: "bain",
        label: "bain",
        keywords: ["bain après tatouage", "baignoire tattoo", "prendre bain", "tremper tatouage"],
        guidance:
          "Tremper un tatouage frais trop longtemps n'est pas recommandé; privilégie les douches rapides.",
      },
      {
        slug: "douche",
        label: "douche",
        keywords: ["douche après tatouage", "se laver tattoo", "eau douche", "lavage douche"],
        guidance:
          "La douche est possible en restant doux, sans eau trop chaude et sans frotter la zone.",
      },
      {
        slug: "spa",
        label: "spa et jacuzzi",
        keywords: ["spa tatouage", "jacuzzi tattoo", "hammam tatouage", "sauna tattoo"],
        guidance:
          "Spa, jacuzzi, sauna et hammam sont à éviter pendant la cicatrisation.",
      },
      {
        slug: "reprise",
        label: "reprendre baignade",
        keywords: ["reprendre piscine", "quand nager", "baignade quand", "retour piscine"],
        guidance:
          "La reprise se fait quand la peau est bien refermée et stabilisée, sans croûtes ni irritation.",
      },
    ],
  },
  {
    category: "sport",
    topics: [
      {
        slug: "reprise",
        label: "reprendre le sport",
        keywords: ["sport après tatouage", "reprendre sport", "musculation tattoo", "course après tatouage"],
        guidance:
          "Il faut éviter le sport pendant les deux premières semaines après la réalisation du tatouage, puis reprendre selon la zone, l'intensité et les frottements possibles.",
      },
      {
        slug: "transpiration",
        label: "transpiration",
        keywords: ["transpiration tatouage", "sueur tattoo", "sport sueur", "transpirer après tattoo"],
        guidance:
          "La transpiration peut irriter un tatouage frais, surtout si elle s'accompagne de frottements.",
      },
      {
        slug: "frottement",
        label: "frottement sport",
        keywords: ["frottement sport", "legging tatouage", "brassière tattoo", "vêtement sport"],
        guidance:
          "Les vêtements serrés et les mouvements répétés peuvent gêner la cicatrisation.",
      },
      {
        slug: "combat",
        label: "sports de combat",
        keywords: ["sport combat tatouage", "boxe tattoo", "judo tattoo", "contact après tatouage"],
        guidance:
          "Les sports de contact demandent plus de prudence, car les chocs et frottements sont plus risqués.",
      },
      {
        slug: "jambe",
        label: "sport après jambe",
        keywords: ["sport tatouage jambe", "course tatouage jambe", "squat tattoo", "mollet sport"],
        guidance:
          "Après un tatouage sur la jambe, certains exercices peuvent tirer ou frotter sur la zone.",
      },
      {
        slug: "bras",
        label: "sport après bras",
        keywords: ["sport tatouage bras", "muscu bras tattoo", "pompes tatouage", "bras sport"],
        guidance:
          "Après un tatouage sur le bras, adapte les exercices qui créent tension, frottements ou transpiration importante.",
      },
    ],
  },
  {
    category: "alimentation avant séance",
    topics: [
      {
        slug: "manger",
        label: "manger avant",
        keywords: ["manger avant tatouage", "repas avant séance", "quoi manger", "venir à jeun"],
        guidance:
          "Il faut éviter de venir à jeun; un repas normal aide à mieux tenir la séance.",
      },
      {
        slug: "sucre",
        label: "sucre et snack",
        keywords: ["sucre tatouage", "snack séance", "bonbon tattoo", "barre céréales"],
        guidance:
          "Pour une longue séance, prévoir un snack peut aider à garder de l'énergie.",
      },
      {
        slug: "eau",
        label: "hydratation",
        keywords: ["boire eau", "hydratation séance", "eau tatouage", "boire avant"],
        guidance:
          "Être bien hydraté aide le corps à mieux gérer la séance.",
      },
      {
        slug: "cafe",
        label: "café",
        keywords: ["café avant tatouage", "cafeine tattoo", "boire café", "énergie café"],
        guidance:
          "Le café n'est pas forcément interdit, mais inutile d'en abuser si ça te rend nerveux.",
      },
      {
        slug: "alcool",
        label: "alcool",
        keywords: ["alcool repas", "alcool avant", "boire veille", "soirée avant"],
        guidance:
          "L'alcool est à éviter dans les 24 à 48 heures avant la séance pour garder un corps stable et éviter de fluidifier le sang.",
      },
      {
        slug: "longue",
        label: "longue séance",
        keywords: ["manger longue séance", "repas longue tattoo", "tenir séance", "fatigue tattoo"],
        guidance:
          "Pour une longue séance, mieux vaut manger correctement avant et prévoir de quoi tenir sans lourdeur.",
      },
    ],
  },
  {
    category: "vêtements",
    topics: [
      {
        slug: "bras",
        label: "vêtement pour bras",
        keywords: ["vêtement bras tatouage", "manche tatouage", "quoi porter bras", "t-shirt séance"],
        guidance:
          "Pour le bras, un haut à manches courtes ou facile à relever simplifie la séance.",
      },
      {
        slug: "jambe",
        label: "vêtement pour jambe",
        keywords: ["vêtement jambe tatouage", "short tattoo", "pantalon séance", "quoi porter jambe"],
        guidance:
          "Pour la jambe, un short ou un vêtement large est souvent plus pratique.",
      },
      {
        slug: "cotes",
        label: "vêtement pour côtes",
        keywords: ["vêtement côtes", "tatouage côtes tenue", "haut côtes tattoo", "quoi porter côtes"],
        guidance:
          "Pour les côtes, il faut un vêtement qui permet l'accès sans te mettre mal à l'aise.",
      },
      {
        slug: "sternum",
        label: "vêtement pour sternum",
        keywords: ["vêtement sternum", "tatouage sternum tenue", "brassière tattoo", "quoi porter sternum"],
        guidance:
          "Pour le sternum, prévois une tenue adaptée et confortable, en respectant ton intimité et le besoin technique.",
      },
      {
        slug: "apres",
        label: "vêtement après tatouage",
        keywords: ["vêtement après tatouage", "frottement vêtement", "habit large", "porter après"],
        guidance:
          "Après la séance, les vêtements larges et propres limitent les frottements.",
      },
      {
        slug: "tache",
        label: "risque de tache",
        keywords: ["tache encre", "vêtement taché", "encre vêtement", "habit séance"],
        guidance:
          "Évite les vêtements fragiles ou très clairs, car une trace d'encre ou de soin peut arriver.",
      },
    ],
  },
  {
    category: "accompagnants",
    topics: [
      {
        slug: "possible",
        label: "venir accompagné",
        keywords: ["venir accompagné", "accompagnant tatouage", "venir avec ami", "quelqu'un avec moi"],
        guidance:
          "Venir accompagné peut parfois être possible, mais il faut demander avant et respecter le calme du studio.",
      },
      {
        slug: "combien",
        label: "nombre d'accompagnants",
        keywords: ["combien accompagnants", "venir à plusieurs", "deux amis tattoo", "groupe studio"],
        guidance:
          "Le studio n'est pas un lieu de groupe; trop de monde gêne la concentration et l'hygiène.",
      },
      {
        slug: "mineur",
        label: "accompagnant mineur",
        keywords: ["mineur accompagnant", "enfant studio", "venir avec enfant", "enfant tatouage"],
        guidance:
          "Venir avec un enfant n'est généralement pas adapté à une séance tattoo.",
      },
      {
        slug: "soutien",
        label: "besoin de soutien",
        keywords: ["soutien séance", "peur venir seul", "ami rassure", "stress accompagné"],
        guidance:
          "Si tu as besoin d'être rassuré, dis-le; le studio peut expliquer le déroulé et garder un cadre calme.",
      },
      {
        slug: "attente",
        label: "attendre pendant séance",
        keywords: ["attendre pendant séance", "salle attente", "ami attend", "accompagnant attend"],
        guidance:
          "L'attente dépend de l'espace disponible et de la durée de séance.",
      },
      {
        slug: "concentration",
        label: "concentration studio",
        keywords: ["concentration tatoueur", "calme studio", "parler séance", "distraction tattoo"],
        guidance:
          "Un environnement calme aide Bryan à rester précis, surtout sur les détails.",
      },
    ],
  },
  {
    category: "annulation",
    topics: [
      {
        slug: "prevenir",
        label: "prévenir annulation",
        keywords: ["annuler rendez-vous", "annulation tattoo", "prévenir annulation", "annuler séance"],
        guidance:
          "Il faut prévenir le plus tôt possible pour que le studio puisse s'organiser.",
      },
      {
        slug: "report",
        label: "reporter séance",
        keywords: ["reporter séance", "changer date", "déplacer rdv", "report tatouage"],
        guidance:
          "Reporter est plus simple quand la demande arrive tôt et que le projet reste confirmé.",
      },
      {
        slug: "malade",
        label: "annuler car malade",
        keywords: ["malade annuler", "fièvre rendez-vous", "report malade", "tatouage malade"],
        guidance:
          "Si tu es malade ou fiévreux, il vaut mieux prévenir et voir avec le studio plutôt que forcer.",
      },
      {
        slug: "derniere-minute",
        label: "dernière minute",
        keywords: ["dernière minute annulation", "annuler dernier moment", "urgence annuler", "pas venir"],
        guidance:
          "Une annulation de dernière minute peut poser problème, car le créneau était réservé pour toi.",
      },
      {
        slug: "no-show",
        label: "absence sans prévenir",
        keywords: ["absence rdv", "pas venu", "no show", "oublier rendez-vous"],
        guidance:
          "Ne pas venir sans prévenir abîme la confiance et peut bloquer de futures demandes.",
      },
      {
        slug: "acompte",
        label: "annulation et acompte",
        keywords: ["annulation acompte", "perdre acompte", "acompte report", "remboursement annulation"],
        guidance:
          "L'acompte est perdu en cas d'annulation définitive ou de changement de date moins de 72 heures avant le rendez-vous; au-delà de 72 heures, il est conservé pour la nouvelle date.",
      },
    ],
  },
  {
    category: "modification projet",
    topics: [
      {
        slug: "avant",
        label: "modifier avant séance",
        keywords: ["modifier projet", "changer idée", "modifier avant séance", "nouvelle idée"],
        guidance:
          "Modifier un projet est possible si c'est demandé assez tôt et si le changement reste cohérent.",
      },
      {
        slug: "jour-j",
        label: "modifier le jour J",
        keywords: ["modifier jour j", "changer dessin séance", "jour même modification", "changer sur place"],
        guidance:
          "Le jour même, seules des adaptations raisonnables sont possibles; une grosse modification peut demander un report.",
      },
      {
        slug: "taille",
        label: "changer taille",
        keywords: ["changer taille projet", "agrandir tatouage", "réduire tatouage", "taille différente"],
        guidance:
          "Changer la taille peut modifier le prix, la durée et la lisibilité du dessin.",
      },
      {
        slug: "zone",
        label: "changer zone",
        keywords: ["changer zone", "changer placement", "autre emplacement", "déplacer tatouage"],
        guidance:
          "Changer la zone implique souvent d'adapter la composition au nouveau placement.",
      },
      {
        slug: "style",
        label: "changer style",
        keywords: ["changer style", "autre style", "modifier ambiance", "changer univers"],
        guidance:
          "Changer complètement de style peut revenir à créer un nouveau projet.",
      },
      {
        slug: "ajouter",
        label: "ajouter des éléments",
        keywords: ["ajouter élément", "rajouter détail", "plusieurs éléments", "compléter projet"],
        guidance:
          "Ajouter trop d'éléments peut rendre le dessin moins lisible; Bryan aide à garder une composition propre.",
      },
    ],
  },
  {
    category: "tailles",
    topics: [
      {
        slug: "petit",
        label: "petite taille",
        keywords: ["petit tatouage", "mini tatouage", "tatouage discret", "petite taille"],
        guidance:
          "Un petit tatouage doit rester simple pour éviter que les détails se ferment avec le temps.",
      },
      {
        slug: "moyen",
        label: "taille moyenne",
        keywords: ["taille moyenne", "tatouage moyen", "10 cm tatouage", "taille raisonnable"],
        guidance:
          "Une taille moyenne permet souvent un bon équilibre entre détail, prix et lisibilité.",
      },
      {
        slug: "grand",
        label: "grande taille",
        keywords: ["grand tatouage", "grosse pièce", "tatouage large", "grande taille"],
        guidance:
          "Un grand tatouage offre plus de respiration au dessin, mais demande plus de temps et d'engagement.",
      },
      {
        slug: "details",
        label: "taille et détails",
        keywords: ["taille détails", "détails petit", "dessin détaillé taille", "lisibilité détails"],
        guidance:
          "Plus un dessin contient de détails, plus il a besoin d'espace.",
      },
      {
        slug: "mesurer",
        label: "indiquer une taille",
        keywords: ["indiquer taille", "mesurer tatouage", "taille en cm", "donner taille"],
        guidance:
          "Pour le devis, indique une taille approximative en centimètres, même si elle sera ajustée ensuite.",
      },
      {
        slug: "adapter",
        label: "adapter taille au corps",
        keywords: ["adapter taille", "taille corps", "proportion tatouage", "taille placement"],
        guidance:
          "La bonne taille dépend aussi de la zone et de la morphologie, pas seulement de l'image de référence.",
      },
    ],
  },
  {
    category: "placements",
    topics: [
      {
        slug: "choisir",
        label: "choisir placement",
        keywords: ["choisir placement", "où placer tatouage", "emplacement tattoo", "placement motif"],
        guidance:
          "Le placement doit suivre la forme du corps et servir le dessin.",
      },
      {
        slug: "visible",
        label: "placement visible",
        keywords: ["tatouage visible", "placement visible", "travail tatouage", "tatouage apparent"],
        guidance:
          "Une zone visible doit être assumée dans la vie quotidienne et professionnelle.",
      },
      {
        slug: "discret",
        label: "placement discret",
        keywords: ["tatouage discret", "placement discret", "cacher tattoo", "zone cachée"],
        guidance:
          "Un placement discret peut être idéal pour un premier tatouage ou un projet plus intime.",
      },
      {
        slug: "mouvement",
        label: "zone mobile",
        keywords: ["zone mobile", "pli tatouage", "tatouage mouvement", "articulation tattoo"],
        guidance:
          "Les zones très mobiles demandent une composition adaptée pour éviter les déformations gênantes.",
      },
      {
        slug: "symetrie",
        label: "symétrie",
        keywords: ["symétrie tatouage", "placement centré", "tatouage droit", "alignement tattoo"],
        guidance:
          "La symétrie se travaille avec le corps réel, pas seulement avec une règle sur écran.",
      },
      {
        slug: "morphologie",
        label: "morphologie",
        keywords: ["morphologie tatouage", "adapter corps", "forme du corps", "placement morphologie"],
        guidance:
          "Un bon tatouage respecte la morphologie et paraît naturel sur la zone.",
      },
    ],
  },
  {
    category: "bras",
    topics: [
      {
        slug: "avant-bras",
        label: "avant-bras",
        keywords: ["avant-bras tatouage", "tatouage avant bras", "douleur avant bras", "placement avant bras"],
        guidance:
          "L'avant-bras est lisible, accessible et souvent apprécié pour un premier ou un projet visible.",
      },
      {
        slug: "interieur",
        label: "intérieur du bras",
        keywords: ["intérieur bras", "tatouage intérieur bras", "douleur intérieur bras", "bras interne"],
        guidance:
          "L'intérieur du bras est plus sensible et plus doux visuellement, mais il demande un placement propre.",
      },
      {
        slug: "coude",
        label: "coude",
        keywords: ["coude tatouage", "douleur coude", "tatouage près coude", "pli coude"],
        guidance:
          "Le coude et ses alentours sont plus techniques et souvent plus intenses.",
      },
      {
        slug: "epaule",
        label: "épaule",
        keywords: ["épaule tatouage", "tatouage epaule", "placement épaule", "douleur épaule"],
        guidance:
          "L'épaule offre un beau volume pour suivre le corps et construire un motif fort.",
      },
      {
        slug: "manchette",
        label: "manchette",
        keywords: ["manchette tatouage", "bras complet", "sleeve tattoo", "demi manchette"],
        guidance:
          "Une manchette demande une vraie composition globale pour éviter l'empilement de motifs sans lien.",
      },
      {
        slug: "poignet",
        label: "poignet",
        keywords: ["poignet tatouage", "douleur poignet", "tatouage poignet", "petit poignet"],
        guidance:
          "Le poignet est visible et sensible, avec une peau fine et une zone très mobile.",
      },
    ],
  },
  {
    category: "main",
    topics: [
      {
        slug: "visible",
        label: "main visible",
        keywords: ["tatouage main visible", "main tatouage", "tatouage visible main", "main travail"],
        guidance:
          "La main est très visible; il faut assumer l'impact social et professionnel.",
      },
      {
        slug: "doigts",
        label: "doigts",
        keywords: ["tatouage doigts", "doigt tattoo", "douleur doigts", "fine line doigt"],
        guidance:
          "Les doigts cicatrisent parfois moins facilement et peuvent nécessiter des retouches.",
      },
      {
        slug: "paume",
        label: "paume",
        keywords: ["tatouage paume", "paume main", "tattoo paume", "paume douleur"],
        guidance:
          "La paume est une zone très particulière, souvent difficile à faire tenir correctement.",
      },
      {
        slug: "dessus",
        label: "dessus de main",
        keywords: ["dessus main", "tatouage dessus main", "main externe", "dos main"],
        guidance:
          "Le dessus de main peut être très fort visuellement, mais il reste exposé et mobile.",
      },
      {
        slug: "cicatrisation",
        label: "cicatrisation main",
        keywords: ["cicatrisation main", "soin main tattoo", "main cicatrise", "laver main tatouage"],
        guidance:
          "La main est souvent lavée et sollicitée, donc les soins doivent être particulièrement sérieux.",
      },
      {
        slug: "premier",
        label: "main en premier tatouage",
        keywords: ["main premier tatouage", "premier tattoo main", "débuter main", "tatouage main débutant"],
        guidance:
          "La main n'est généralement pas la zone la plus douce pour commencer, car elle est très visible et technique.",
      },
    ],
  },
  {
    category: "côtes",
    topics: [
      {
        slug: "douleur",
        label: "douleur côtes",
        keywords: ["douleur côtes", "tatouage côte mal", "côtes fait mal", "tattoo ribs"],
        guidance:
          "Les côtes sont souvent plus sensibles, notamment à cause des os et de la respiration.",
      },
      {
        slug: "respiration",
        label: "respiration",
        keywords: ["respirer côtes", "tatouage respiration", "bouger côtes", "côtes respiration"],
        guidance:
          "La respiration fait bouger la zone, donc le placement et le calme pendant la séance comptent beaucoup.",
      },
      {
        slug: "placement",
        label: "placement côtes",
        keywords: ["placement côtes", "tatouage flanc", "côté corps tattoo", "zone côtes"],
        guidance:
          "Un motif sur les côtes doit suivre la ligne du corps pour rester élégant.",
      },
      {
        slug: "taille",
        label: "taille sur côtes",
        keywords: ["taille côtes", "petit tatouage côtes", "grand flanc", "dessin côtes"],
        guidance:
          "Sur les côtes, une taille suffisante permet souvent un rendu plus fluide et lisible.",
      },
      {
        slug: "vetement",
        label: "vêtement côtes",
        keywords: ["vêtement côtes", "tenue côtes", "quoi porter côtes", "tattoo flanc tenue"],
        guidance:
          "Prévois une tenue qui donne accès à la zone tout en te laissant à l'aise.",
      },
      {
        slug: "soins",
        label: "soins côtes",
        keywords: ["soins côtes", "frottement côtes", "soutien gorge tattoo", "vêtement serré côtes"],
        guidance:
          "Après un tatouage sur les côtes, il faut éviter les frottements de vêtements serrés pendant la cicatrisation.",
      },
    ],
  },
  {
    category: "jambe",
    topics: [
      {
        slug: "cuisse",
        label: "cuisse",
        keywords: ["tatouage cuisse", "douleur cuisse", "placement cuisse", "cuisse tattoo"],
        guidance:
          "La cuisse offre une belle surface et une douleur souvent accessible.",
      },
      {
        slug: "mollet",
        label: "mollet",
        keywords: ["tatouage mollet", "douleur mollet", "mollet tattoo", "placement mollet"],
        guidance:
          "Le mollet peut être plus sensible qu'on l'imagine, mais il donne un rendu très lisible.",
      },
      {
        slug: "genou",
        label: "genou",
        keywords: ["tatouage genou", "douleur genou", "autour genou", "rotule tattoo"],
        guidance:
          "Le genou et ses contours sont plus intenses et demandent une vraie préparation mentale.",
      },
      {
        slug: "cheville",
        label: "cheville",
        keywords: ["tatouage cheville", "douleur cheville", "cheville tattoo", "petit cheville"],
        guidance:
          "La cheville est une zone fine et proche de l'os, souvent plus sensible.",
      },
      {
        slug: "tibia",
        label: "tibia",
        keywords: ["tatouage tibia", "douleur tibia", "tibia tattoo", "jambe avant"],
        guidance:
          "Le tibia peut être intense car l'os est proche, mais le rendu peut être très graphique.",
      },
      {
        slug: "sport",
        label: "sport après jambe",
        keywords: ["sport jambe tattoo", "course après tatouage", "legging tatouage", "marche après tattoo"],
        guidance:
          "Après un tatouage sur la jambe, il faut adapter sport, vêtements serrés et longues marches selon la zone.",
      },
    ],
  },
  {
    category: "sternum",
    topics: [
      {
        slug: "douleur",
        label: "douleur sternum",
        keywords: ["douleur sternum", "sternum mal", "tatouage sternum douleur", "entre seins tattoo"],
        guidance:
          "Le sternum est souvent sensible, car la peau est fine et proche de l'os.",
      },
      {
        slug: "placement",
        label: "placement sternum",
        keywords: ["placement sternum", "tatouage sous poitrine", "tattoo sternum placement", "symétrie sternum"],
        guidance:
          "Le placement doit être précis, car le sternum attire vite l'œil sur l'alignement.",
      },
      {
        slug: "symetrie",
        label: "symétrie sternum",
        keywords: ["symétrie sternum", "sternum centré", "tatouage symétrique", "alignement sternum"],
        guidance:
          "La symétrie se travaille avec la posture réelle du corps, pas seulement sur une image.",
      },
      {
        slug: "vetement",
        label: "vêtement sternum",
        keywords: ["vêtement sternum", "quoi porter sternum", "brassière tattoo", "soutien gorge tatouage"],
        guidance:
          "Il faut prévoir une tenue pratique, confortable et compatible avec l'accès à la zone.",
      },
      {
        slug: "soins",
        label: "soins sternum",
        keywords: ["soins sternum", "frottement sternum", "soutien gorge après", "cicatrisation sternum"],
        guidance:
          "Après la séance, les frottements de vêtements ou lingerie doivent être limités autant que possible.",
      },
      {
        slug: "motif",
        label: "motif sternum",
        keywords: ["motif sternum", "ornement sternum", "mandala sternum", "dessin sternum"],
        guidance:
          "Les motifs symétriques, ornementaux ou verticaux fonctionnent souvent bien sur cette zone.",
      },
    ],
  },
  {
    category: "cou",
    topics: [
      {
        slug: "visible",
        label: "cou visible",
        keywords: ["tatouage cou visible", "cou tattoo", "tatouage gorge", "tatouage nuque"],
        guidance:
          "Le cou est très visible; il faut assumer le projet dans le quotidien et le travail.",
      },
      {
        slug: "douleur",
        label: "douleur cou",
        keywords: ["douleur cou", "tatouage cou mal", "nuque douleur", "gorge tattoo douleur"],
        guidance:
          "Le cou peut être sensible selon la zone: nuque, côté du cou ou gorge ne se vivent pas pareil.",
      },
      {
        slug: "nuque",
        label: "nuque",
        keywords: ["tatouage nuque", "douleur nuque", "placement nuque", "nuque tattoo"],
        guidance:
          "La nuque peut être plus discrète que le côté du cou, tout en restant une zone forte.",
      },
      {
        slug: "gorge",
        label: "gorge",
        keywords: ["tatouage gorge", "gorge tattoo", "douleur gorge", "cou devant"],
        guidance:
          "La gorge est une zone très engagée, sensible et visible; elle demande un projet vraiment assumé.",
      },
      {
        slug: "travail",
        label: "cou et travail",
        keywords: ["cou travail", "tatouage visible travail", "emploi tatouage cou", "cacher cou"],
        guidance:
          "Avant de tatouer le cou, il faut réfléchir à l'impact possible dans ton environnement professionnel.",
      },
      {
        slug: "soins",
        label: "soins cou",
        keywords: ["soins cou", "cicatrisation cou", "col vêtement", "frottement cou"],
        guidance:
          "Le cou peut frotter avec les cols, cheveux ou accessoires; il faut adapter les soins et les vêtements.",
      },
    ],
  },
  {
    category: "conversation",
    topics: [
      {
        slug: "bonjour",
        label: "bonjour",
        keywords: ["bonjour", "salut", "hello", "coucou", "bonsoir", "yo", "hey"],
        guidance:
          "L'assistant accueille la personne et l'invite à poser une question tattoo précise.",
        customAnswers: [
          "Salut, moi c'est Bobot, l'assistant de B.Grumpy Tattoo. Je peux t'aider sur les douleurs, les soins, le prix, les flashs, les placements ou la préparation de séance. Dis-moi ce que tu veux savoir et je te réponds simplement.",
          "Bonjour, ravi de t'aider. Pose-moi ta question tattoo: projet, devis, douleur, cicatrisation, rendez-vous ou choix de zone. Je te donne une réponse claire, comme si on préparait ton projet au studio.",
          "Hello, je suis là pour t'orienter. Si tu as une idée de tatouage, une question sur une zone ou un doute avant séance, envoie-moi ça et on cadre les choses proprement.",
        ],
      },
      {
        slug: "ca_va",
        label: "ça va",
        keywords: ["ça va", "ca va", "comment ça va", "comment ca va", "tu vas bien", "la forme"],
        guidance:
          "L'assistant répond chaleureusement puis ramène naturellement vers les questions tattoo.",
        customAnswers: [
          "Ça va très bien, merci. Prêt à t'aider à préparer ton projet tattoo avec calme et précision. Tu veux parler douleur, prix, placement, soins ou idée de motif ?",
          "Tout va bien de mon côté. On est en mode préparation de projet: tu me poses ta question, je t'aide à y voir clair sans te noyer d'informations.",
          "Oui, nickel. Bobot est prêt. Dis-moi ce que tu veux savoir sur ton tatouage et je te réponds comme un assistant de studio: simple, utile et sans blabla inutile.",
        ],
      },
      {
        slug: "merci",
        label: "merci",
        keywords: ["merci", "merci beaucoup", "super merci", "parfait merci", "thanks"],
        guidance:
          "L'assistant répond poliment et propose de continuer si besoin.",
        customAnswers: [
          "Avec plaisir. Si tu veux aller plus loin, tu peux me demander une zone, une douleur, un soin ou une question de devis.",
          "De rien. Si ton projet se précise, pense au formulaire de devis avec la zone, la taille, les références et ton idée générale.",
          "Avec plaisir, on avance proprement. Tu peux poser une autre question si tu veux affiner ton projet.",
        ],
      },
      {
        slug: "au_revoir",
        label: "au revoir",
        keywords: ["au revoir", "bye", "à bientôt", "a bientot", "bonne journée", "bonne soiree", "bonne soirée"],
        guidance:
          "L'assistant clôture gentiment la conversation.",
        customAnswers: [
          "À bientôt. Et si ton idée de tatouage revient en tête, le formulaire de devis est là pour envoyer tout ça proprement à Bryan.",
          "Bonne journée, et prends le temps de bien cadrer ton projet. Un bon tatouage commence souvent par une bonne préparation.",
          "À bientôt chez B.Grumpy Tattoo. Quand tu veux, tu reviens avec ta question ou ton idée de projet.",
        ],
      },
      {
        slug: "qui_es_tu",
        label: "qui es-tu",
        keywords: ["qui es tu", "t'es qui", "tu es qui", "assistant", "chat", "ia", "bot"],
        guidance:
          "L'assistant explique qu'il s'agit d'une FAQ locale pensée pour orienter les clients.",
        customAnswers: [
          "Je suis Bobot, l'assistant FAQ de B.Grumpy Tattoo. Je ne remplace pas Bryan, mais je peux t'aider à comprendre les grandes questions: prix, soins, douleur, rendez-vous, flashs et préparation.",
          "Je suis Bobot, un assistant local du site, pensé pour répondre aux questions fréquentes du studio. Pour un vrai devis personnalisé, Bryan aura toujours besoin de ton formulaire avec les détails du projet.",
          "Je suis Bobot, là pour t'orienter avant de contacter le studio. Je peux donner des repères fiables, mais la décision finale dépend toujours du projet, de la zone et de l'analyse de Bryan.",
        ],
      },
      {
        slug: "peux_tu_m_aider",
        label: "peux-tu m'aider",
        keywords: ["aide moi", "peux tu aider", "tu peux m'aider", "j'ai besoin d'aide", "question tattoo"],
        guidance:
          "L'assistant demande le sujet à traiter.",
        customAnswers: [
          "Oui, bien sûr. Dis-moi si ta question concerne la douleur, le prix, les soins, un flash, un placement, un premier tatouage ou une idée de projet.",
          "Oui. Envoie-moi ton doute en une phrase, par exemple: 'est-ce que les côtes font mal ?' ou 'comment préparer ma séance ?'.",
          "Je peux t'aider à débroussailler le sujet. Pour un devis exact, il faudra ensuite passer par le formulaire avec les infos du projet.",
        ],
      },
      {
        slug: "humour",
        label: "réponse cool",
        keywords: ["mdr", "haha", "lol", "trop cool", "incroyable", "grave"],
        guidance:
          "L'assistant répond avec naturel sans perdre le cadre professionnel.",
        customAnswers: [
          "On garde l'énergie, mais on prépare le projet sérieusement. Dis-moi la zone, le style ou ta question, et je t'aide à cadrer ça.",
          "Oui, on peut garder le côté cool, tant que le tattoo reste bien pensé. Tu veux parler motif, douleur, prix ou soins ?",
          "Bonne énergie. Maintenant on passe en mode préparation: quelle est ta vraie question tattoo ?",
        ],
      },
      {
        slug: "urgence",
        label: "urgence ou inquiétude",
        keywords: ["urgent", "urgence", "j'ai peur", "infection", "pus", "fièvre", "gonflé très mal", "douleur forte"],
        guidance:
          "L'assistant donne une consigne de sécurité claire.",
        customAnswers: [
          "Si tu as fièvre, pus, douleur qui augmente, rougeur qui s'étend ou gonflement inquiétant, il faut contacter rapidement un professionnel de santé. Préviens aussi le studio, mais ne laisse pas traîner une réaction qui paraît anormale.",
          "Pour une réaction forte ou un doute médical, le bon réflexe est de demander un avis médical rapidement. Le chat peut t'orienter, mais il ne doit pas remplacer un professionnel de santé.",
          "Si la situation te semble anormale ou urgente, ne cherche pas à gérer ça seul. Contacte un professionnel de santé, puis informe Bryan avec une photo nette et le contexte.",
        ],
      },
      {
        slug: "idee_floue",
        label: "idée de tatouage floue",
        keywords: ["je sais pas quoi faire", "idée floue", "pas d'idée", "envie tatouage", "besoin idée", "inspiration tattoo"],
        guidance:
          "L'assistant aide à transformer une envie vague en piste de projet.",
        customAnswers: [
          "Si ton idée est encore floue, ce n'est pas grave. Commence par l'ambiance: sombre, doux, végétal, manga, symbolique, discret ou très visible. Ensuite, Bryan peut t'aider à transformer ça en projet cohérent avec la zone et la taille.",
          "Pas besoin d'arriver avec un dessin parfait. Tu peux partir d'un mot, d'une émotion, d'un personnage, d'une plante ou d'une référence visuelle. Le plus important, c'est de donner une direction claire pour éviter un tatouage qui mélange trop d'idées.",
          "Quand l'idée n'est pas encore nette, le bon réflexe est de rassembler quelques références et d'expliquer ce que tu aimes dedans. Bryan pourra ensuite voir ce qui est tatouable, lisible et cohérent avec son style.",
        ],
      },
      {
        slug: "envoyer_photo",
        label: "envoyer une photo de référence",
        keywords: ["envoyer photo", "photo référence", "référence projet", "image inspiration", "screenshot", "photo tattoo"],
        guidance:
          "L'assistant explique comment envoyer des références utiles.",
        customAnswers: [
          "Oui, les photos de référence sont très utiles. Elles ne servent pas à copier, mais à comprendre l'ambiance, le niveau de détail, la composition et ce que tu veux éviter. Plus tes références sont claires, plus le projet peut être cadré proprement.",
          "Tu peux envoyer plusieurs images: une pour le style, une pour la pose, une pour l'ambiance, une pour la zone. L'idée est d'aider Bryan à comprendre ton univers sans transformer le projet en collage impossible.",
          "Une bonne référence, c'est une image nette avec une intention claire. Si tu envoies dix images très différentes, pense à préciser ce que tu aimes dans chacune, sinon le projet peut partir dans tous les sens.",
        ],
      },
      {
        slug: "petit_budget",
        label: "petit budget",
        keywords: ["petit budget", "pas cher", "budget serré", "moins cher", "prix bas", "budget limité"],
        guidance:
          "L'assistant répond avec tact sur les limites d'un budget serré.",
        customAnswers: [
          "Avec un budget serré, le mieux est d'adapter le projet plutôt que de forcer une grande pièce trop détaillée. On peut réduire la taille, simplifier certains éléments ou partir sur un flash plus accessible, mais il faut garder un résultat propre.",
          "Un tatouage vraiment pas cher finit souvent par coûter cher si le rendu n'est pas bon. Le plus intelligent est de donner ton budget maximum dans le formulaire pour que Bryan voie ce qui est réaliste sans sacrifier la qualité.",
          "Si ton budget est limité, sois transparent dès le départ. Ça permet de cadrer une proposition honnête: moins de détails, une zone plus simple ou une taille adaptée, plutôt qu'une promesse impossible.",
        ],
      },
      {
        slug: "tatouage_discret",
        label: "tatouage discret",
        keywords: ["tatouage discret", "tattoo caché", "petit discret", "pas visible", "cacher tatouage", "travail discret"],
        guidance:
          "L'assistant conseille les zones discrètes et les limites techniques.",
        customAnswers: [
          "Pour un tatouage discret, on pense souvent aux côtes, à la cheville, au haut de la cuisse, à l'intérieur du bras ou à une zone facilement couverte par les vêtements. Il faut juste garder une taille suffisante pour que le dessin reste propre.",
          "Discret ne veut pas forcément dire minuscule. Un tatouage trop petit avec trop de détails peut mal vieillir. Le bon équilibre, c'est une zone facile à cacher et un motif assez lisible.",
          "Si tu veux quelque chose de discret pour le travail ou la famille, précise-le dans ta demande. Bryan pourra proposer un placement plus malin et éviter une zone trop visible au quotidien.",
        ],
      },
      {
        slug: "peur_regret",
        label: "peur de regretter",
        keywords: ["peur regret", "regret tatouage", "j'hésite", "pas sûr", "doute tatouage", "peur me lasser"],
        guidance:
          "L'assistant rassure sans pousser à la décision.",
        customAnswers: [
          "Si tu as peur de regretter, ralentir est une bonne idée. Un tatouage ne doit pas être fait sous pression. Prends le temps de vérifier que le motif, la zone et le style te parlent vraiment, même après quelques jours.",
          "Le doute n'est pas forcément mauvais: il permet de mieux cadrer. Mais si tu hésites sur tout, motif, zone, taille et style, ce n'est peut-être pas encore le bon moment pour lancer la séance.",
          "Un bon projet doit rester évident au-delà de l'impulsion du moment. Tu peux garder tes références quelques jours, revenir dessus, puis envoyer une demande quand l'idée tient encore debout.",
        ],
      },
      {
        slug: "style_bryan",
        label: "style de Bryan",
        keywords: ["style bryan", "style b grumpy", "univers bryan", "tatoueur style", "patte bryan", "bgrumpy style"],
        guidance:
          "L'assistant explique l'importance de respecter l'univers du tatoueur.",
        customAnswers: [
          "Le mieux est de venir vers Bryan parce que son univers te parle déjà. Tu peux apporter ton idée, mais il faut laisser de la place à sa patte pour que le résultat soit cohérent et pas juste une copie d'une image trouvée ailleurs.",
          "Chaque tatoueur a une manière de composer, de tracer et de gérer les détails. Si tu choisis B.Grumpy, l'objectif est de créer un projet qui respecte ton idée tout en restant dans une direction esthétique maîtrisée.",
          "Un projet fonctionne mieux quand il y a une vraie confiance dans le style du tatoueur. Tu peux guider l'intention, les références et la symbolique, puis laisser Bryan construire une version tatouable.",
        ],
      },
      {
        slug: "estimation_rapide",
        label: "estimation rapide",
        keywords: ["estimation rapide", "tu peux estimer", "prix environ", "à peu près combien", "combien ça coûte environ"],
        guidance:
          "L'assistant refuse le prix exact mais explique les infos nécessaires.",
        customAnswers: [
          "Je peux t'expliquer ce qui influence le prix, mais pas te donner un tarif exact sans voir le projet. Pour estimer correctement, il faut la zone, la taille, le style, le niveau de détail et quelques références.",
          "Un prix donné trop vite serait rarement fiable. Deux tatouages de 10 cm peuvent demander un temps très différent selon les détails, l'emplacement et la préparation du dessin.",
          "Pour avoir une estimation sérieuse, passe par le formulaire de devis. Avec la taille, la zone, les références et ton budget, Bryan pourra répondre beaucoup plus justement.",
        ],
      },
      {
        slug: "peau_sensible",
        label: "peau sensible",
        keywords: ["peau sensible", "eczéma", "psoriasis", "allergie peau", "peau fragile", "problème de peau"],
        guidance:
          "L'assistant oriente vers la prudence et l'avis médical.",
        customAnswers: [
          "Si tu as une peau sensible, de l'eczéma, du psoriasis ou une réaction cutanée active, il faut le signaler avant. En cas de doute, demande un avis médical avant la séance: mieux vaut sécuriser que forcer.",
          "Une peau fragile ne veut pas forcément dire tatouage impossible, mais le contexte compte beaucoup. La zone doit être saine le jour J, sans irritation forte ni poussée active.",
          "Pour les soucis de peau, Bobot peut donner des repères, mais pas remplacer un avis médical. Préviens Bryan avec les infos importantes pour qu'il puisse voir si le projet est raisonnable.",
        ],
      },
    ],
  },
];

const questionFormulations = [
  (topic: FaqTopic) => topic.question,
  (topic: FaqTopic) => topic.secondQuestion,
  (topic: FaqTopic) => `Tu peux m'expliquer ${topic.label} ?`,
  (topic: FaqTopic) => `J'ai une question sur ${topic.label}.`,
  (topic: FaqTopic) => `Comment ça se passe pour ${topic.label} ?`,
  (topic: FaqTopic) => `Je dois savoir quoi sur ${topic.label} ?`,
  (topic: FaqTopic) => `Est-ce que tu peux me rassurer sur ${topic.label} ?`,
  (topic: FaqTopic) => `C'est important pour ${topic.label} ?`,
  (topic: FaqTopic) => `Quel conseil pour ${topic.label} ?`,
  (topic: FaqTopic) => `Bryan conseille quoi pour ${topic.label} ?`,
  (topic: FaqTopic) => `Franchement, je dois m'inquiéter pour ${topic.label} ?`,
  (topic: FaqTopic) => `J'hésite à cause de ${topic.label}, tu en penses quoi ?`,
  (topic: FaqTopic) => `Tu me répondrais quoi si je demande ${topic.label} au studio ?`,
  (topic: FaqTopic) => `J'ai besoin d'un avis simple sur ${topic.label}.`,
  (topic: FaqTopic) => `C'est une bonne idée de penser à ${topic.label} avant le rendez-vous ?`,
  (topic: FaqTopic) => `Je prépare mon tatouage, parle-moi de ${topic.label}.`,
  (topic: FaqTopic) => `Ça change quelque chose pour ${topic.label} ?`,
  (topic: FaqTopic) => `Je suis un peu perdu avec ${topic.label}.`,
  (topic: FaqTopic) => `Tu peux me faire un résumé sur ${topic.label} ?`,
  (topic: FaqTopic) => `Qu'est-ce que les clients demandent souvent sur ${topic.label} ?`,
  (topic: FaqTopic) => `Je veux éviter les erreurs avec ${topic.label}.`,
  (topic: FaqTopic) => `Comment Bryan gère ${topic.label} ?`,
  (topic: FaqTopic) => `Je peux avoir une réponse honnête sur ${topic.label} ?`,
  (topic: FaqTopic) => `Dis-moi les points importants pour ${topic.label}.`,
];

const answerOpenings = [
  "Oui, je peux te donner un repère clair.",
  "La réponse sérieuse dépend toujours un peu du projet, mais on peut déjà cadrer les bases.",
  "Bonne question, parce que ce détail change souvent la façon de préparer la séance.",
  "Pour te répondre simplement, il faut penser confort, lisibilité et cicatrisation.",
  "Dans un studio tattoo, on préfère être précis plutôt que promettre n'importe quoi.",
  "Le plus important, c'est d'éviter les décisions au hasard.",
  "On peut voir ça comme une préparation de quête: mieux c'est cadré, plus la séance se passe bien.",
  "La version courte: il faut rester réaliste et propre techniquement.",
  "C'est exactement le genre de sujet qu'il vaut mieux poser avant la séance.",
  "Je te réponds comme on le ferait au studio: simple, honnête et utile.",
  "Oui, et c'est une bonne question parce que ça évite souvent les mauvaises surprises.",
  "Je vais te répondre avec une logique de studio, pas avec une réponse copiée-collée.",
  "Le bon réflexe, c'est de regarder ce sujet avant de bloquer un créneau.",
  "On peut cadrer ça tranquillement, sans dramatiser et sans minimiser.",
  "Je te donne la réponse la plus utile pour préparer un vrai rendez-vous.",
  "Ce point mérite d'être anticipé, surtout si tu veux un résultat propre sur le long terme.",
  "On va garder ça clair: le but, c'est que tu comprennes avant de décider.",
  "C'est une question très normale, surtout quand on prépare un projet sérieux.",
  "Je préfère te donner une réponse prudente et réaliste.",
  "Dans l'esprit B.Grumpy, on évite les réponses floues et les promesses faciles.",
];

const makeQuestions = (topic: FaqTopic, variantIndex: number) => [
  questionFormulations[variantIndex](topic),
  questionFormulations[(variantIndex + 1) % questionFormulations.length](topic),
  questionFormulations[(variantIndex + 3) % questionFormulations.length](topic),
];

const makeAnswers = (topic: FaqTopic, variantIndex: number) => {
  if (topic.customAnswers?.length) {
    return [
      topic.customAnswers[variantIndex % topic.customAnswers.length],
      topic.customAnswers[(variantIndex + 1) % topic.customAnswers.length],
      topic.customAnswers[(variantIndex + 2) % topic.customAnswers.length],
      `${answerOpenings[variantIndex % answerOpenings.length]} ${topic.customAnswers[variantIndex % topic.customAnswers.length]}`,
      `${topic.customAnswers[(variantIndex + 1) % topic.customAnswers.length]} Si tu veux une réponse vraiment adaptée à ton projet, ajoute la zone, la taille et quelques références dans le formulaire.`,
      `${answerOpenings[(variantIndex + 3) % answerOpenings.length]} ${topic.customAnswers[(variantIndex + 2) % topic.customAnswers.length]}`,
    ];
  }

  const intro = categoryIntroductions[topic.category] ?? "La réponse dépend du projet, de la zone et de ta peau.";
  const opening = answerOpenings[variantIndex % answerOpenings.length];

  return [
    `${opening} ${intro} Pour ${topic.label}, ${topic.guidance} Le plus important est de garder un projet lisible, propre et réaliste plutôt que de forcer une idée qui ne tiendra pas bien sur la peau.`,
    `${opening} Sur ${topic.label}, la réponse sérieuse est rarement un simple oui ou non. ${topic.guidance} Chez B.Grumpy, l'idée est de cadrer le projet avant la séance pour que tu saches à quoi t'attendre et que Bryan puisse travailler dans de bonnes conditions.`,
    `${opening} ${topic.guidance} C'est exactement le genre de détail qui se valide mieux avec une photo, une taille approximative et la zone précise. ${studioFallback}`,
    `${opening} ${topic.guidance} Ce qui compte, c'est de ne pas décider uniquement sur une image vue en ligne: le corps, la taille et la cicatrisation changent beaucoup le résultat final.`,
    `${opening} Pour ${topic.label}, Bryan regardera surtout la faisabilité, le rendu dans le temps et le confort pendant la séance. Si le projet est bien préparé, tout devient plus simple.`,
    `${opening} ${intro} Mon conseil: garde une demande claire, des références utiles et une taille réaliste. Ensuite le studio peut ajuster proprement sans casser l'idée de départ.`,
  ];
};

const makeEntry = (topic: FaqTopic, variantIndex: number): TattooFaqEntry => ({
  id: `${topic.category}_${topic.slug}_${variantIndex + 1}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase(),
  category: topic.category,
  keywords: [
    topic.label,
    topic.category,
    topic.question,
    topic.secondQuestion,
    ...makeQuestions(topic, variantIndex),
    ...topic.keywords,
  ],
  questions: makeQuestions(topic, variantIndex),
  answers: makeAnswers(topic, variantIndex),
});

const faqTopics: FaqTopic[] = topicGroups.flatMap((group) =>
  group.topics.map((topic) => ({
    ...topic,
    category: group.category,
    question: `Question sur ${topic.label} ?`,
    secondQuestion: `Que faut-il savoir pour ${topic.label} ?`,
  })),
);

export const tattooFaq: TattooFaqEntry[] = faqTopics.flatMap((topic) =>
  questionFormulations.map((_, variantIndex) => makeEntry(topic, variantIndex)),
);

export const tattooFaqEntryCount = tattooFaq.length;

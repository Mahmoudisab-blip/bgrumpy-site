export type TattooArticleIcon =
  | "brush"
  | "badgeCheck"
  | "leaf"
  | "crosshair"
  | "sparkles"
  | "timer";

export type TattooArticle = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  icon: TattooArticleIcon;
  intro: string;
  sections: {
    title: string;
    body: string;
  }[];
  closing: string;
};

export const tattooArticles: TattooArticle[] = [
  {
    slug: "bien-choisir-son-motif",
    title: "Bien choisir son motif",
    category: "Inspiration",
    summary: "Ma façon de transformer une idée floue en vrai projet de tatouage.",
    icon: "brush",
    intro:
      "Quand quelqu'un arrive avec une idée pas encore très claire, pour moi ce n'est pas un problème. Au contraire, c'est souvent là que le projet devient intéressant. On prend l'envie de base et on la fait monter de niveau, tranquillement.",
    sections: [
      {
        title: "Partir d'une intention simple",
        body:
          "Avant de chercher le dessin parfait sur Pinterest pendant trois heures, demande-toi ce que tu veux ressentir quand tu le verras sur ta peau. Protection, force, souvenir, nature, renouveau, côté dark ou plus doux: quelques mots suffisent pour lancer la quête.",
      },
      {
        title: "Rassembler sans copier",
        body:
          "Les références, c'est très utile. Ça me montre l'ambiance, les formes, le style que tu aimes. Mais le but n'est pas de copier le tatouage de quelqu'un d'autre. Le but, c'est de créer une version qui a ton énergie à toi.",
      },
      {
        title: "Penser au temps long",
        body:
          "Un tatouage, ce n'est pas un sticker de téléphone qu'on change quand on se lasse. Il faut qu'il reste lisible, bien placé et agréable à porter. Les détails trop serrés, je préfère les calmer un peu plutôt que te vendre un boss final qui vieillit mal.",
      },
    ],
    closing:
      "Le bon motif, c'est celui qui te parle vraiment et qui tient la route sur ta peau, pas juste sur une capture d'écran.",
  },
  {
    slug: "preparer-sa-seance",
    title: "Préparer sa séance",
    category: "Conseils",
    summary: "Les bons réflexes avant de venir, pour que la séance se passe bien.",
    icon: "badgeCheck",
    intro:
      "Une séance, ce n'est pas un combat contre ton corps. Si tu arrives reposé, nourri et avec une peau en bon état, on part déjà avec une belle jauge d'énergie.",
    sections: [
      {
        title: "Dormir et manger correctement",
        body:
          "Viens après une vraie nuit si possible, et mange avant. Même pour un petit tatouage, ton corps travaille. Arriver à jeun, c'est le meilleur moyen de se sentir faible alors qu'on aurait pu éviter ça facilement.",
      },
      {
        title: "Hydrater la peau les jours avant",
        body:
          "Une peau hydratée, c'est plus agréable à travailler. Les jours avant, tu peux hydrater la zone. Le jour même, évite de tartiner sans me prévenir. Et si la peau est cramée par le soleil, là on perd des points.",
      },
      {
        title: "Prévoir une tenue pratique",
        body:
          "Mets un vêtement confortable qui laisse accès à la zone. Si on tatoue la cuisse, ne viens pas en jean ultra serré, tu vois l'idée. Pour une séance longue, une boisson et un petit snack, c'est toujours une bonne potion de soin.",
      },
    ],
    closing:
      "Bien préparé, tu profites mieux du moment, et moi je peux me concentrer à fond sur un tatouage propre.",
  },
  {
    slug: "apres-le-tatouage",
    title: "Après le tatouage",
    category: "Soin",
    summary: "Les gestes simples pour aider ton tatouage à cicatriser correctement.",
    icon: "leaf",
    intro:
      "Une fois le tatouage terminé, l'aventure n'est pas finie. La cicatrisation, c'est un peu l'arc d'entraînement: pas spectaculaire, mais super important pour le résultat final.",
    sections: [
      {
        title: "Nettoyer avec délicatesse",
        body:
          "Avant de toucher ton tatouage, lave-toi les mains. Nettoie doucement, sans frotter comme si tu voulais effacer une malédiction. Ensuite, tu sèches en tapotant avec quelque chose de propre.",
      },
      {
        title: "Hydrater sans étouffer",
        body:
          "La crème, c'est une fine couche. Pas besoin de transformer le tatouage en tartine brillante. Trop de produit peut étouffer la peau. On accompagne la cicatrisation, on ne la noie pas.",
      },
      {
        title: "Éviter les agressions",
        body:
          "Pendant quelques semaines, évite piscine, sauna, soleil, frottements et grattage. Les petites peaux doivent tomber seules. Je sais, ça gratte, mais là il faut avoir la discipline du héros qui ne craque pas au mauvais moment.",
      },
    ],
    closing:
      "Si tu as un doute, tu me demandes. Mieux vaut un message rapide qu'une improvisation bizarre trouvée au fond d'internet.",
  },
  {
    slug: "placement-et-douleur",
    title: "Placement et douleur",
    category: "Guide",
    summary: "Choisir une zone qui va bien au motif, au corps et à ta résistance.",
    icon: "crosshair",
    intro:
      "Le placement, ce n'est pas juste 'je le mets là parce qu'il reste de la place'. Une bonne zone peut rendre un motif beaucoup plus fort. Une mauvaise zone peut le compliquer pour rien.",
    sections: [
      {
        title: "Lire la forme du corps",
        body:
          "J'aime quand le dessin suit le corps: avant-bras, clavicule, omoplate, hanche, mollet. Quand le motif épouse la zone, il a l'air d'être à sa place, pas juste posé là comme un autocollant.",
      },
      {
        title: "Comprendre les zones sensibles",
        body:
          "La douleur change selon les personnes, mais certaines zones piquent plus: côtes, sternum, coude, genou, intérieur du bras. Ce n'est pas impossible, mais il faut savoir dans quelle arène tu entres.",
      },
      {
        title: "Adapter la taille au lieu",
        body:
          "Un motif trop petit sur une grande zone peut perdre en impact. À l'inverse, trop de détails dans un mini format, ça peut devenir brouillon avec le temps. Je préfère ajuster pour que le tatouage ait de la présence.",
      },
    ],
    closing:
      "Le bon placement, c'est l'équilibre entre style, lisibilité et confort. On cherche le spot qui fait gagner le tatouage.",
  },
  {
    slug: "flash-ou-projet-unique",
    title: "Flash ou projet unique",
    category: "Style",
    summary: "Mon avis pour choisir entre un flash prêt à tatouer et une pièce créée pour toi.",
    icon: "sparkles",
    intro:
      "Flash ou projet unique, il n'y a pas de mauvais camp. C'est juste deux chemins différents pour arriver au tatouage qui te fait dire: ok, celui-là il est pour moi.",
    sections: [
      {
        title: "Choisir un flash",
        body:
          "Un flash, c'est un dessin que j'ai déjà préparé. Si tu as un vrai coup de coeur, fonce. C'est souvent plus direct: tu vois le motif, il te parle, on cale la taille et la zone, et l'aventure commence.",
      },
      {
        title: "Créer sur mesure",
        body:
          "Le sur mesure part de ton idée, de tes références et de ton corps. On discute plus, je réfléchis plus, et on construit une pièce pensée pour toi. C'est le mode création de personnage, mais version peau.",
      },
      {
        title: "Faire confiance au style",
        body:
          "Dans les deux cas, choisis un tatoueur dont l'univers te plaît déjà. Si tu viens me voir, laisse-moi aussi mettre ma patte. C'est comme ça qu'on garde un résultat cohérent et vivant.",
      },
    ],
    closing:
      "Flash ou sur mesure, le bon choix c'est celui qui te donne envie de le porter longtemps, pas juste de le liker deux secondes.",
  },
  {
    slug: "combien-de-temps-prevoir",
    title: "Combien de temps prévoir",
    category: "Séance",
    summary: "Pourquoi une séance peut durer une heure, trois heures ou beaucoup plus.",
    icon: "timer",
    intro:
      "Le temps d'un tatouage, ce n'est pas une formule magique. Un petit motif très détaillé peut demander plus de concentration qu'un dessin plus grand mais plus simple. La taille compte, mais elle ne joue pas seule.",
    sections: [
      {
        title: "La complexité du dessin",
        body:
          "Lignes fines, textures, ombrages, remplissages, petits détails: tout ça ajoute du temps. Il y a aussi le stencil, les ajustements, le placement. La séance commence avant le premier trait.",
      },
      {
        title: "La zone tatouée",
        body:
          "Certaines zones sont plus simples à travailler. D'autres demandent de changer de position, de tendre la peau différemment, de faire plus de pauses. Pour garder un tracé propre, parfois on ralentit volontairement.",
      },
      {
        title: "Votre confort",
        body:
          "Les pauses font partie du jeu, surtout sur les grosses pièces. On n'est pas là pour prouver qu'on peut souffrir en silence pendant six heures. On avance proprement, avec endurance, comme un bon entraînement.",
      },
    ],
    closing:
      "Pour une estimation juste, donne-moi la zone, la taille et des références. Plus j'ai d'infos, mieux je peux prévoir le temps réel.",
  },
  {
    slug: "comment-est-fixe-le-prix",
    title: "Comment est fixé le prix",
    category: "Devis",
    summary: "Comment je calcule un tarif, et pourquoi chaque projet mérite son propre devis.",
    icon: "badgeCheck",
    intro:
      "Le prix d'un tatouage, ce n'est pas juste une taille multipliée par un chiffre. Je regarde le temps, le niveau de détail, la zone, le dessin à préparer et ce qu'il faut pour faire une pièce propre. Un bon devis, c'est la carte de mission avant de partir.",
    sections: [
      {
        title: "La taille donne une base, pas tout le prix",
        body:
          "Oui, la taille compte. Mais deux tatouages de 10 cm peuvent être totalement différents à réaliser. Un petit symbole simple et une pièce fine avec textures, ombrages et plein de détails, ce n'est pas le même niveau.",
      },
      {
        title: "La complexité change beaucoup l'estimation",
        body:
          "Plus il y a de détails, de dégradés, de remplissages ou de lignes précises, plus il faut de temps et de concentration. C'est un peu comme passer d'un ennemi de base à un boss avec plusieurs phases.",
      },
      {
        title: "L'emplacement compte aussi",
        body:
          "Certaines zones se tatouent facilement, d'autres demandent plus d'installation, plus de pauses ou plus de prudence. Une côte, un coude ou une zone très mobile, ça ne se travaille pas comme un avant-bras tranquille.",
      },
      {
        title: "Le dessin fait partie du travail",
        body:
          "Quand c'est du sur mesure, je passe du temps à comprendre l'idée, trier les références, composer le motif et l'adapter à la zone. Ce travail compte aussi. La machine n'est pas encore allumée, mais le tatouage est déjà en train de se construire.",
      },
      {
        title: "Pourquoi demander des informations précises",
        body:
          "Quand je demande la zone, la taille, le style et des références, ce n'est pas pour faire compliqué. C'est pour viser juste. Plus la demande est claire, plus le prix annoncé est fiable.",
      },
    ],
    closing:
      "Un bon prix, ce n'est pas le moins cher possible. C'est le prix juste pour prendre le temps, travailler proprement et te laisser avec un tatouage que tu seras content de porter.",
  },
];

export function getTattooArticle(slug: string) {
  return tattooArticles.find((article) => article.slug === slug);
}

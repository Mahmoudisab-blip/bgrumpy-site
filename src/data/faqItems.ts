export type FAQItemData = {
  category: string;
  question: string;
  answer: string[];
};

export const faqItems: FAQItemData[] = [
  {
    category: "Acompte",
    question: "Pourquoi l'acompte n'est-il pas remboursable ?",
    answer: [
      "L'acompte permet avant tout de rémunérer tout le travail réalisé avant même le jour du tatouage, ainsi que le temps entièrement consacré à votre projet ✨",
      "Un projet demande du temps : les échanges, les recherches, la réflexion autour de la composition, l'adaptation du projet à la peau, au placement et au style du shop.",
      "Même lorsque le dessin n'est pas envoyé immédiatement, le travail sur le projet commence dès la prise de rendez-vous 🌿",
      "L'acompte est ensuite déduit du prix final du tatouage.",
    ],
  },
  {
    category: "Acompte",
    question: "Dans quels cas l'acompte est-il perdu ?",
    answer: [
      "L'acompte ne pourra pas être récupéré en cas : d'annulation définitive, d'absence au rendez-vous, de report demandé moins de 72h avant la séance ou de changement complet de projet.",
      "Toute l'organisation se prépare plusieurs jours à l'avance, donc une annulation au dernier moment est souvent très compliquée à réorganiser ✨",
      "En revanche, lorsqu'un report est demandé suffisamment tôt, l'acompte peut généralement être conservé pour une nouvelle date.",
    ],
  },
  {
    category: "Devis",
    question: "Comment faire une demande de devis ?",
    answer: [
      "Pour pouvoir répondre correctement à une demande, il est important d'avoir le plus d'informations possible dès le départ 🌿",
      "L'idéal est d'envoyer tout ça directement via la demande de devis du site ou via Instagram : une description du projet, quelques références, la zone à tatouer, la taille en centimètres ainsi que les disponibilités ✨",
      "Quelques centimètres peuvent complètement changer le temps de travail et donc le tarif final.",
    ],
  },
  {
    category: "Projet",
    question: "Les projets personnalisés sont-ils possibles ?",
    answer: [
      "Oui ✨ Le shop réalise énormément de projets personnalisés, notamment autour du manga, de l'anime, du black & grey et de la pop culture.",
      "Chaque projet est retravaillé pour garder un rendu propre, lisible et agréable à porter dans le temps 🌿",
      "Le but n'est pas simplement de reproduire un dessin. Certains détails ou effets qui fonctionnent bien sur une image ne sont parfois pas réalisables proprement en tatouage, donc chaque projet est adapté pour garder un rendu beau, lisible et durable sur la peau.",
    ],
  },
  {
    category: "Rendez-vous",
    question: "Comment bien préparer sa séance ?",
    answer: [
      "Une bonne préparation avant la séance, c'est vraiment important 🌿",
      "Il est donc important avant une séance de bien dormir, bien manger et bien s'hydrater.",
      "Un corps reposé supporte beaucoup mieux le tatouage, surtout pendant les longues séances ✨",
      "Il est également conseillé de porter des vêtements confortables adaptés à la zone tatouée, et surtout des vêtements que vous n'avez pas peur de tacher ✨",
    ],
  },
  {
    category: "Rendez-vous",
    question: "Que faut-il éviter avant une séance ?",
    answer: [
      "Dans les 24 à 48 heures avant le rendez-vous, il est fortement déconseillé de consommer de l'alcool ou certaines substances ✨",
      "L'alcool, les anti-inflammatoires, l'aspirine ou les produits qui fluidifient le sang compliquent le travail pendant la séance et peuvent également impacter le résultat final du tatouage ainsi que la cicatrisation.",
      "Le but est d'avoir une peau dans les meilleures conditions possibles le jour du tatouage 🌿",
    ],
  },
  {
    category: "Rendez-vous",
    question: "Peut-on utiliser une crème anesthésiante ?",
    answer: [
      "Les crèmes anesthésiantes sont fortement déconseillées et ne doivent pas être appliquées avant une séance.",
      "Elles modifient la texture de la peau, compliquent le travail pendant la séance et impactent le rendu final ainsi que la cicatrisation du tatouage ✨",
    ],
  },
  {
    category: "Rendez-vous",
    question: "Peut-on venir accompagné ?",
    answer: [
      "Une seule personne accompagnante maximum est conseillée afin de garder un environnement calme et agréable pendant les séances 🌿",
      "Le but reste de garder un environnement calme et agréable pendant les séances.",
    ],
  },
  {
    category: "Rendez-vous",
    question: "Que se passe-t-il en cas de retard ?",
    answer: [
      "Les retards peuvent évidemment arriver 🌿 Tant que je suis prévenu, ce n'est pas un problème. Tout dépend surtout du temps de retard et de l'organisation de la journée ✨",
      "Selon le temps perdu, cela peut entraîner une séance raccourcie ou un report du rendez-vous.",
    ],
  },
  {
    category: "Soins & cicatrisation",
    question: "Que faire après la séance ?",
    answer: [
      "Les premiers jours sont très importants pour la cicatrisation 🌿 Le film protecteur doit être retiré le plus tôt possible, idéalement dès votre retour à la maison, afin de laisser le tatouage respirer correctement. Il ne faut surtout pas garder le film trop longtemps ni en remettre ensuite ✨",
      "Le tatouage doit être nettoyé délicatement avec un savon pH neutre, toujours avec des mains propres.",
      "Après le nettoyage, il faut sécher doucement en tapotant avec du papier absorbant propre, jamais avec une serviette, et sans frotter ✨",
      "Le plus important reste ensuite de laisser le tatouage respirer correctement.",
    ],
  },
  {
    category: "Soins & cicatrisation",
    question: "Comment hydrater correctement le tatouage ?",
    answer: [
      "Une fine couche de crème cicatrisante peut être appliquée afin d'aider la peau pendant la cicatrisation 🌿",
      "Mais contrairement à ce que beaucoup pensent, un tatouage ne doit jamais être noyé sous la crème.",
      "Trop hydrater peut ramollir la peau, ralentir la cicatrisation et parfois même compliquer le rendu final ✨",
      "La crème sert surtout à aider à supporter les démangeaisons pendant la cicatrisation. D'ailleurs, beaucoup considèrent que la meilleure méthode reste la cicatrisation à sec.",
      "Si tu es un vrai guerrier et que ta peau le supporte correctement, laisser respirer naturellement le tatouage avec très peu de crème donne souvent d'excellents résultats 🌿",
      "Le plus important reste surtout : une peau propre, peu de frottements, pas de grattage et une bonne hygiène pendant toute la cicatrisation.",
    ],
  },
  {
    category: "Soins & cicatrisation",
    question: "Les rougeurs et croûtes sont-elles normales ?",
    answer: [
      "Oui ✨ Après une séance, il est totalement normal d'avoir : des rougeurs, des démangeaisons, une légère sensation de chaleur ou de petites croûtes.",
      "Le corps réagit naturellement pendant la cicatrisation 🌿",
      "Le plus important est de laisser la peau tranquille et de ne jamais arracher les croûtes, même si c'est tentant.",
    ],
  },
  {
    category: "Soins & cicatrisation",
    question: "Que faut-il éviter pendant la cicatrisation ?",
    answer: [
      "Pendant plusieurs semaines, le tatouage reste une peau fragilisée ✨",
      "Il faut donc éviter : la piscine, les bains, le sauna, le hammam, le soleil, le sport intensif ainsi que les gros frottements.",
      "Même lorsqu'un tatouage semble cicatrisé en surface, la peau continue encore de travailler pendant plusieurs semaines 🌿",
      "Une bonne cicatrisation joue énormément sur le rendu final.",
    ],
  },
  {
    category: "Douleur",
    question: "Est-ce que les tatouages font mal ?",
    answer: [
      "La douleur dépend énormément de la personne, de la zone tatouée et de la durée de la séance ✨",
      "Certaines zones sont très faciles à supporter alors que d'autres sont clairement plus sportives 🌿",
      "Mais dans la majorité des cas, les gens appréhendent beaucoup plus qu'ils ne souffrent réellement.",
    ],
  },
  {
    category: "Styles",
    question: "Quels styles sont proposés au shop ?",
    answer: [
      "Le shop travaille principalement autour du noir et gris avec des influences manga/anime, blackwork, fine line, floral et pop culture ✨",
      "Chaque projet est adapté pour garder quelque chose de propre, cohérent et agréable à porter sur le corps 🌿",
    ],
  },
  {
    category: "Flashs",
    question: "Les flashs sont-ils reproductibles ?",
    answer: [
      "Les flashs ne sont normalement pas reproduits, sauf accord avec un ou plusieurs proches ✨",
    ],
  },
  {
    category: "Retouches",
    question: "Une retouche est-elle possible ?",
    answer: [
      "Une séance de retouche est incluse dans le prix du tatouage si une prise de contact est faite dans le mois suivant la séance 🌿 Après ce délai, les retouches peuvent être facturées.",
      "Chaque peau réagit différemment 🌿 Certains tatouages n'auront jamais besoin de retouche alors que d'autres zones ou certains détails peuvent en nécessiter une après cicatrisation.",
    ],
  },
];

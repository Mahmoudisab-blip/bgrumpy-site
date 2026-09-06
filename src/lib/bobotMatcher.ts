import { bobotSynonyms } from "@/src/data/bobotSynonyms";
import { bobotTopics } from "@/src/data/bobotTopics";
import { tattooFaq, type TattooFaqEntry } from "@/src/data/faqData";
import { bobotStudioResponseRules } from "@/src/data/bobotStudioResponses";
import { generateBobotAnswer } from "@/src/lib/bobotGenerator";
import {
  calculateSimilarity,
  containsAny,
  normalizeText,
  tokenizeText,
} from "@/src/lib/bobotTextUtils";

export const BOBOT_FALLBACK =
  "Merci pour ton message 🌿\nLe mieux est d’envoyer directement ton projet via le formulaire de contact afin que Bryan puisse te répondre précisément selon ton idée, le placement et le style souhaité.";

const OUT_OF_SCOPE_WORDS = [
  "meteo",
  "weather",
  "voiture",
  "car",
  "ordinateur",
  "computer",
  "informatique",
  "recette",
  "recipe",
  "football",
  "soccer",
  "banque",
  "bank",
  "impot",
  "tax",
  "voyage",
  "travel",
  "hotel",
];

const SENSITIVE_WORDS = [
  "infection",
  "infected",
  "pus",
  "fievre",
  "fièvre",
  "fever",
  "tres mal",
  "très mal",
  "douleur forte",
  "severe pain",
  "very painful",
  "gonfle",
  "gonflé",
  "swollen",
  "swelling",
  "allergie severe",
  "allergie sévère",
  "severe allergy",
  "chaud",
  "hot",
  "brulure",
  "brûlure",
  "burning",
];

const placementWords = [
  "bras",
  "arm",
  "forearm",
  "main",
  "hand",
  "doigts",
  "finger",
  "fingers",
  "cotes",
  "côtes",
  "ribs",
  "sternum",
  "dos",
  "back",
  "colonne",
  "spine",
  "omoplate",
  "shoulder blade",
  "epaule",
  "épaule",
  "shoulder",
  "cuisse",
  "thigh",
  "mollet",
  "calf",
  "genou",
  "knee",
  "cheville",
  "ankle",
  "pied",
  "foot",
  "cou",
  "neck",
  "nuque",
  "ventre",
  "belly",
  "stomach",
  "hanche",
  "hip",
  "torse",
  "chest",
];

const painWords = [
  "douleur",
  "mal",
  "fait mal",
  "douloureux",
  "sensible",
  "supportable",
  "douillet",
  "peur de la douleur",
  "hurte",
  "pain",
  "painful",
];

const priceWords = [
  "prix",
  "tarif",
  "cout",
  "coût",
  "combien",
  "budget",
  "devis",
  "payer",
  "cher",
];

const bodyZoneRules = [
  { words: ["bras", "avant bras", "poignet", "coude", "epaule", "épaule"], label: "le bras", answerKey: "douleur_bras" },
  { words: ["main", "doigt", "doigts", "paume"], label: "la main ou les doigts", answerKey: "douleur_main" },
  { words: ["cotes", "côtes", "flanc", "sternum", "torse", "poitrine"], label: "les côtes ou le torse", answerKey: "douleur_cotes" },
  { words: ["dos", "colonne", "omoplate"], label: "le dos", answerKey: "douleur" },
  { words: ["cuisse", "mollet", "jambe", "genou", "cheville", "pied"], label: "la jambe", answerKey: "douleur" },
  { words: ["cou", "nuque", "gorge"], label: "le cou ou la nuque", answerKey: "douleur" },
  { words: ["ventre", "hanche", "fesse"], label: "le ventre ou la hanche", answerKey: "douleur" },
];

function findBodyZone(message: string) {
  return bodyZoneRules.find((zone) => containsAny(message, zone.words));
}

function findStudioResponse(message: string) {
  return bobotStudioResponseRules.find((rule) => {
    const matchesAll = rule.all?.every((group) => containsAny(message, group)) ?? true;
    return matchesAll && containsAny(message, rule.any);
  })?.answer;
}

function scoreFaqEntry(message: string, entry: TattooFaqEntry) {
  const normalizedMessage = normalizeText(message);
  const messageTokens = new Set(tokenizeText(message));
  let bestScore = 0;

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    const keywordTokens = tokenizeText(keyword);

    if (keywordTokens.length === 0 || normalizedKeyword.length < 5) {
      continue;
    }

    if (normalizedMessage.includes(normalizedKeyword)) {
      const phraseScore = 20 + keywordTokens.length * 7 + Math.min(normalizedKeyword.length, 36) / 10;
      bestScore = Math.max(bestScore, phraseScore);
      continue;
    }

    const sharedTokens = keywordTokens.filter((token) => messageTokens.has(token)).length;

    if (sharedTokens >= 2) {
      bestScore = Math.max(
        bestScore,
        sharedTokens * 8 + (sharedTokens === keywordTokens.length ? 6 : 0),
      );
    }
  }

  return bestScore;
}

function stableIndex(value: string, length: number) {
  if (length <= 1) {
    return 0;
  }

  const hash = Array.from(value).reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) >>> 0,
    7,
  );

  return hash % length;
}

function findFaqAnswer(message: string) {
  const rankedEntries = tattooFaq
    .map((entry) => ({ entry, score: scoreFaqEntry(message, entry) }))
    .filter(({ score }) => score >= 28)
    .sort((left, right) => right.score - left.score);

  const uniqueEntries = rankedEntries.filter(({ entry }, index, entries) => {
    const baseId = entry.id.replace(/_\d+$/, "");

    return entries.findIndex(({ entry: candidate }) => candidate.id.replace(/_\d+$/, "") === baseId) === index;
  });

  const best = uniqueEntries[0];
  const second = uniqueEntries[1];

  if (!best || (second && best.score - second.score < 2)) {
    return undefined;
  }

  const answers = best.entry.answers.slice(0, 3).filter(Boolean);

  return answers[stableIndex(message, answers.length)]?.slice(0, 850);
}

function getPainAnswer(message: string) {
  const zone = findBodyZone(message);

  if (!zone) {
    return undefined;
  }

  if (zone.answerKey !== "douleur") {
    return generateBobotAnswer(zone.answerKey);
  }

  return `Pour ${zone.label}, la sensation dépend de ta sensibilité, de la taille du motif et du temps de séance. Cette zone peut être plus ou moins intense selon sa proximité avec les os, les articulations et les frottements. Si tu m’indiques le style et la taille envisagée, je peux te donner un repère plus précis ; le placement final se valide avec Bryan.`;
}

function getCombinedPainAndPriceAnswer(message: string) {
  const zone = findBodyZone(message);
  const painLine = zone
    ? `Pour ${zone.label}, la douleur dépend surtout de ta sensibilité, de la taille et du temps de séance ; je préfère donc te donner un repère plutôt qu’une note universelle.`
    : "Pour la douleur, le repère dépend surtout de la zone, de la taille, de la durée et de ta sensibilité ; il n’y a pas une note valable pour tout le monde.";

  return `${painLine}\n\nPour le prix, Bryan regarde la zone, la taille, le style, le niveau de détail et le temps de préparation. Le tarif n’est pas calculé uniquement au centimètre. Envoie le projet avec une taille en cm et tes références dans le formulaire de devis pour obtenir une estimation sérieuse.`;
}

function scoreList(message: string, values: string[], score: number) {
  const normalizedMessage = normalizeText(message);
  const tokens = tokenizeText(message);

  return values.reduce((total, value) => {
    const normalizedValue = normalizeText(value);

    if (normalizedMessage.includes(normalizedValue)) {
      return total + score;
    }

    const valueTokens = tokenizeText(value);
    const tokenMatches = valueTokens.filter((token) => tokens.includes(token)).length;

    return total + tokenMatches;
  }, 0);
}

function scoreSynonyms(message: string, topicText: string) {
  const normalizedTopicText = normalizeText(topicText);

  return Object.values(bobotSynonyms).reduce((score, words) => {
    const topicHasFamily = words.some((word) => normalizedTopicText.includes(normalizeText(word)));
    const messageHasFamily = containsAny(message, words);

    return topicHasFamily && messageHasFamily ? score + 4 : score;
  }, 0);
}

function scoreTopic(message: string, topic: (typeof bobotTopics)[number]) {
  const topicText = [
    topic.category,
    ...topic.keywords,
    ...topic.intents,
    ...topic.questionPatterns,
  ].join(" ");

  let score = topic.priority ?? 0;
  score += scoreList(message, topic.keywords, 8);
  score += scoreList(message, topic.intents, 10);
  score += scoreList(message, topic.questionPatterns, 6);
  score += containsAny(message, [topic.category]) ? 3 : 0;
  score += scoreSynonyms(message, topicText);

  if (containsAny(message, placementWords) && containsAny(topicText, placementWords)) {
    score += 5;
  }

  const similarity = Math.max(
    ...topic.questionPatterns.map((pattern) => calculateSimilarity(message, pattern)),
  );

  score += Math.round(similarity * 8);

  return score;
}

export function findBestBobotAnswer(message: string): string {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return "Tu peux m’écrire ta question tattoo en quelques mots, Bobot s’occupe du tri 🌿";
  }

  const studioResponse = findStudioResponse(message);

  if (studioResponse && !containsAny(message, ["acompte", "arrhes"])) {
    return studioResponse;
  }

  if (containsAny(normalizedMessage, OUT_OF_SCOPE_WORDS)) {
    return "Bobot est surtout là pour les questions tattoo 🌿 Pour ton projet, tes soins, un flash, un devis ou une réservation, je peux t’aider avec plaisir.";
  }

  if (containsAny(normalizedMessage, SENSITIVE_WORDS)) {
    return "Si la zone devient très douloureuse, chaude, gonflée, avec du pus ou de la fièvre, il vaut mieux demander rapidement un avis médical. Pour le suivi du tatouage, tu peux aussi envoyer une photo claire au studio afin que Bryan voie l’évolution.";
  }

  const hasPainIntent = containsAny(message, painWords);
  const hasPriceIntent = containsAny(message, priceWords);

  if (hasPainIntent && hasPriceIntent) {
    return getCombinedPainAndPriceAnswer(message);
  }

  if (hasPainIntent) {
    const painAnswer = getPainAnswer(message);

    if (painAnswer) {
      return painAnswer;
    }
  }

  const faqAnswer = findFaqAnswer(message);

  if (faqAnswer) {
    return faqAnswer;
  }

  const [bestTopic] = bobotTopics
    .map((topic) => ({
      topic,
      score: scoreTopic(message, topic),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return (right.topic.priority ?? 0) - (left.topic.priority ?? 0);
    });

  if (!bestTopic || bestTopic.score < 8) {
    const zone = findBodyZone(message);

    if (zone) {
      return `Je peux t’aider pour ${zone.label}. Tu veux surtout savoir si c’est douloureux, quelle taille choisir, comment le tatouage va vieillir ou combien le projet peut coûter ?`;
    }

    return "Je peux t’aider sur la douleur, les soins, le prix, les flashs, les styles, les covers ou la prise de rendez-vous. Dis-moi simplement le point précis qui t’intéresse et je te réponds clairement.";
  }

  return generateBobotAnswer(bestTopic.topic.answerKeys[0] ?? "conversation");
}

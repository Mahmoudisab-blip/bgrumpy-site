import { bobotSynonyms } from "@/src/data/bobotSynonyms";
import { bobotTopics } from "@/src/data/bobotTopics";
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

  if (containsAny(normalizedMessage, OUT_OF_SCOPE_WORDS)) {
    return "Bobot est surtout là pour les questions tattoo 🌿 Pour ton projet, tes soins, un flash, un devis ou une réservation, je peux t’aider avec plaisir.";
  }

  if (containsAny(normalizedMessage, SENSITIVE_WORDS)) {
    return "Si la zone devient très douloureuse, chaude, gonflée, avec du pus ou de la fièvre, il vaut mieux demander rapidement un avis médical. Pour le suivi du tatouage, tu peux aussi envoyer une photo claire au studio afin que Bryan voie l’évolution.";
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
    return BOBOT_FALLBACK;
  }

  return generateBobotAnswer(bestTopic.topic.answerKeys[0] ?? "conversation");
}

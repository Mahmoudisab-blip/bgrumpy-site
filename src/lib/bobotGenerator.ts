import { bobotDirectAnswerPacks } from "@/src/data/bobotResponseFragments";

let recentAnswerKeys: string[] = [];
let recentCombinations: string[] = [];

export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function rememberAnswer(answerKey: string, combination: string) {
  recentAnswerKeys = [answerKey, ...recentAnswerKeys.filter((key) => key !== answerKey)].slice(0, 5);
  recentCombinations = [
    combination,
    ...recentCombinations.filter((item) => item !== combination),
  ].slice(0, 8);
}

export function generateBobotAnswer(answerKey: string): string {
  const answers = bobotDirectAnswerPacks[answerKey] ?? bobotDirectAnswerPacks.conversation;
  const safeAnswers = answers ?? [
    "Oui, je peux te répondre sur ce sujet tattoo. Donne-moi la zone, la taille ou une référence si tu veux une réponse plus précise.",
  ];

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const answer = getRandomItem(safeAnswers);
    const combination = `${answerKey}:${answer}`;

    if (!recentCombinations.includes(combination) || !recentAnswerKeys.includes(answerKey)) {
      rememberAnswer(answerKey, combination);
      return answer.slice(0, 700);
    }
  }

  const fallback = getRandomItem(safeAnswers);

  rememberAnswer(answerKey, fallback);
  return fallback.slice(0, 700);
}

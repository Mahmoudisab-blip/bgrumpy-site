"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { findBestBobotAnswer } from "@/src/lib/bobotMatcher";
import { normalizeText } from "@/src/lib/bobotTextUtils";
import styles from "./TattooChatWidget.module.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const bobotAvatarStyle = {
  backgroundImage: "url('/005B9E19-A17B-4C22-9465-F6AEA394C4CE.png')",
};

const starterMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Bonjour, moi c'est Bobot, l'assistant de B.Grumpy Tattoo. Pose-moi une question sur ton projet, la douleur, les soins, le prix ou la préparation.",
  },
];

const quietStarterMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Bobot est là si tu as une question sur ton projet, la douleur, les soins, le prix ou la préparation.",
  },
];

const bobotGreetingStorageKey = "bgrumpy-bobot-last-greeting";
const bobotDailyAnswersStorageKey = "bgrumpy-bobot-daily-answers";
const greetingCooldownMs = 24 * 60 * 60 * 1000;
const greetingWords = [
  "bonjour",
  "salut",
  "hello",
  "coucou",
  "bonsoir",
  "bjr",
  "hi",
  "hey",
  "good morning",
  "good evening",
];

const repeatGreetingAnswers = [
  "Re bonjour, je suis toujours là. Dis-moi ce que tu veux savoir côté tattoo.",
  "Re salut, Bobot est encore dans le coin. On parle projet, douleur, soins ou devis ?",
  "Re coucou, je t'écoute. Envoie ta question tattoo et je te réponds simplement.",
  "Re hello, on reprend tranquillement. Tu veux cadrer quelle partie de ton projet ?",
  "Re bonjour, prêt à continuer. Pose-moi ta question et je fais le tri.",
  "Re salut. Je suis là, tu peux m'envoyer directement ta question.",
  "Encore là. Tu veux parler du projet, du rendez-vous ou des soins ?",
  "Oui, je suis toujours disponible. Qu'est-ce que tu veux vérifier ?",
  "On continue. Envoie-moi le point qui bloque et je t'aide à le cadrer.",
  "Je te lis. Tu veux une réponse sur le prix, la douleur, un flash ou la cicatrisation ?",
  "Hi again. You can ask me about your tattoo project, pain, aftercare or pricing.",
  "Hey, still here. Send me your tattoo question and I will help you sort it out.",
];

const repeatAnswerOpenings = [
  "Je te confirme: ",
  "Oui, clairement: ",
  "Réponse courte: ",
  "Pour être précis: ",
  "Dans ce cas: ",
  "Le point important: ",
];

const quickQuestions = [
  "Comment préparer ma séance ?",
  "Comment est calculé le prix ?",
  "Est-ce que ça fait mal ?",
  "Comment prendre rendez-vous ?",
  "Quels soins après tatouage ?",
  "Peut-on modifier un flash ?",
  "Est-ce possible de faire un projet manga ?",
  "Comment fonctionne un cover ?",
  "Combien de temps dure la cicatrisation ?",
  "Peut-on venir accompagné ?",
];

const getTypingDelay = (message: string) =>
  500 + (Array.from(message).reduce((total, character) => total + character.charCodeAt(0), 0) % 401);

function getLastBobotGreetingAt() {
  if (typeof window === "undefined") {
    return 0;
  }

  return Number(window.localStorage.getItem(bobotGreetingStorageKey) ?? 0);
}

function hasRecentBobotGreeting() {
  const lastGreetingAt = getLastBobotGreetingAt();

  return lastGreetingAt > 0 && Date.now() - lastGreetingAt < greetingCooldownMs;
}

function rememberBobotGreeting() {
  window.localStorage.setItem(bobotGreetingStorageKey, String(Date.now()));
}

function getStarterMessages() {
  if (hasRecentBobotGreeting()) {
    return quietStarterMessages;
  }

  if (typeof window !== "undefined") {
    rememberBobotGreeting();
  }

  return starterMessages;
}

function isGreetingForBobot(message: string) {
  const normalizedMessage = normalizeText(message);
  const mentionsBobot = normalizedMessage.includes("bobot");
  const saysHello = greetingWords.some((word) => normalizedMessage.includes(word));

  return saysHello && (mentionsBobot || normalizedMessage.split(" ").length <= 3);
}

function getRepeatGreetingAnswer(message: string, previousAnswers: string[]) {
  const startIndex =
    Array.from(message).reduce((total, character) => total + character.charCodeAt(0), 0) %
    repeatGreetingAnswers.length;

  for (let index = 0; index < repeatGreetingAnswers.length; index += 1) {
    const answer = repeatGreetingAnswers[(startIndex + previousAnswers.length + index) % repeatGreetingAnswers.length];

    if (!previousAnswers.includes(answer)) {
      return answer;
    }
  }

  return `Re salut, je suis toujours là. Message ${previousAnswers.length + 1}: dis-moi ce que tu veux préparer.`;
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function loadDailyAnswers() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const storedValue = window.localStorage.getItem(bobotDailyAnswersStorageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : {};

    return typeof parsedValue === "object" && parsedValue !== null
      ? (parsedValue as Record<string, Record<string, string[]>>)
      : {};
  } catch {
    return {};
  }
}

function saveDailyAnswers(answerHistory: Record<string, Record<string, string[]>>) {
  window.localStorage.setItem(bobotDailyAnswersStorageKey, JSON.stringify(answerHistory));
}

function getQuestionHistory(answerHistory: Record<string, Record<string, string[]>>, question: string) {
  const today = getTodayKey();
  const questionKey = normalizeText(question);

  answerHistory[today] ??= {};
  answerHistory[today][questionKey] ??= [];

  return {
    questionKey,
    today,
    previousAnswers: answerHistory[today][questionKey],
  };
}

function compactAnswerHistory(answerHistory: Record<string, Record<string, string[]>>) {
  const today = getTodayKey();

  return {
    [today]: answerHistory[today] ?? {},
  };
}

function makeUniqueAnswer(answer: string, previousAnswers: string[]) {
  for (let index = 0; index < repeatAnswerOpenings.length; index += 1) {
    const opening = repeatAnswerOpenings[(previousAnswers.length + index) % repeatAnswerOpenings.length];
    const uniqueAnswer = `${opening}${answer.charAt(0).toLowerCase()}${answer.slice(1)}`;

    if (!previousAnswers.includes(uniqueAnswer)) {
      return uniqueAnswer;
    }
  }

  return `Je te le redis simplement: ${answer.charAt(0).toLowerCase()}${answer.slice(1)}`;
}

function generateBobotReply(question: string, previousAnswers: string[] = []) {
  const isGreeting = isGreetingForBobot(question);
  const hasRecentGreeting = hasRecentBobotGreeting();

  if (isGreeting && !hasRecentGreeting) {
    rememberBobotGreeting();
  }

  return isGreeting && hasRecentGreeting
    ? getRepeatGreetingAnswer(question, previousAnswers)
    : findBestBobotAnswer(question);
}

function getUniqueBobotAnswer(question: string) {
  const answerHistory = compactAnswerHistory(loadDailyAnswers());
  const { previousAnswers } = getQuestionHistory(answerHistory, question);
  const isRepeatGreeting = isGreetingForBobot(question) && hasRecentBobotGreeting();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const answer = generateBobotReply(question, previousAnswers);

    if (!previousAnswers.includes(answer)) {
      previousAnswers.push(answer);
      saveDailyAnswers(answerHistory);
      return answer;
    }
  }

  const uniqueAnswer = isRepeatGreeting
    ? getRepeatGreetingAnswer(`${question}-${previousAnswers.length}`, previousAnswers)
    : makeUniqueAnswer(generateBobotReply(question, previousAnswers), previousAnswers);

  previousAnswers.push(uniqueAnswer);
  saveDailyAnswers(answerHistory);

  return uniqueAnswer;
}

export default function TattooChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(quietStarterMessages);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const chatMessages = useMemo(
    () => messages.filter((message) => message.content.trim()),
    [messages],
  );

  useEffect(() => {
    const starterTimer = window.setTimeout(() => {
      setMessages(getStarterMessages());
    }, 0);

    return () => window.clearTimeout(starterTimer);
  }, []);

  useEffect(() => {
    const messagesElement = messagesRef.current;

    if (!messagesElement) {
      return;
    }

    messagesElement.scrollTo({
      top: messagesElement.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  function sendMessage(content: string) {
    const question = content.trim();

    if (!question || loading) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: question,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    window.setTimeout(() => {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: getUniqueBobotAnswer(question),
        },
      ]);
      setLoading(false);
    }, getTypingDelay(question));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  function openChat() {
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 120);
  }

  return (
    <div className={styles.widget}>
      {open ? (
        <section className={styles.panel} aria-label="Chat IA tatouage">
          <header className={styles.header}>
            <div className={styles.headerIdentity}>
              <span
                className={styles.headerAvatar}
                style={bobotAvatarStyle}
                aria-hidden="true"
              >
                <span className={styles.avatarFallback}>B</span>
              </span>
              <div>
                <p className={styles.kicker}>Chat tattoo</p>
                <h2 className={styles.title}>Question pour Bobot ?</h2>
              </div>
            </div>
            <button
              className={styles.iconButton}
              type="button"
              aria-label="Fermer le chat"
              onClick={() => setOpen(false)}
            >
              <X className={styles.icon} strokeWidth={1.8} />
            </button>
          </header>

          <div className={styles.messages} ref={messagesRef} aria-live="polite">
            {chatMessages.map((message, index) =>
              message.role === "assistant" ? (
                <div
                  className={styles.assistantRow}
                  key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                >
                  <span
                    className={styles.messageAvatar}
                    style={bobotAvatarStyle}
                    aria-hidden="true"
                  >
                    <span className={styles.avatarFallback}>B</span>
                  </span>
                  <p className={`${styles.message} ${styles.messageAssistant}`}>
                    {message.content}
                  </p>
                </div>
              ) : (
                <p
                  className={`${styles.message} ${styles.messageUser}`}
                  key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                >
                  {message.content}
                </p>
              ),
            )}
            {loading ? (
              <div className={styles.assistantRow}>
                <span
                  className={styles.messageAvatar}
                  style={bobotAvatarStyle}
                  aria-hidden="true"
                >
                  <span className={styles.avatarFallback}>B</span>
                </span>
                <p className={styles.thinking}>Bobot écrit...</p>
              </div>
            ) : null}
          </div>

          <div className={styles.quickList} aria-label="Questions rapides">
            {quickQuestions.map((question) => (
              <button
                className={styles.quickButton}
                type="button"
                key={question}
                onClick={() => sendMessage(question)}
                disabled={loading}
              >
                {question}
              </button>
            ))}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <textarea
              className={styles.input}
              ref={inputRef}
              value={input}
              maxLength={600}
              rows={2}
              placeholder="Pose ta question tattoo..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage(input);
                }
              }}
            />
            <button
              className={styles.sendButton}
              type="submit"
              aria-label="Envoyer"
              disabled={loading || !input.trim()}
            >
              <Send className={styles.sendIcon} strokeWidth={1.8} />
            </button>
          </form>
        </section>
      ) : (
        <button
          className={styles.launcher}
          type="button"
          aria-label="Ouvrir le chat IA tatouage"
          onClick={openChat}
        >
          <span
            className={styles.launcherAvatar}
            style={bobotAvatarStyle}
            aria-hidden="true"
          >
            <span className={styles.avatarFallback}>B</span>
          </span>
          <MessageCircle className={styles.launcherIcon} strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

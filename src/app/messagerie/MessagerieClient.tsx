"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCheck,
  Clock3,
  ImagePlus,
  MessageSquareText,
  Paperclip,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";
import {
  getThreadQuoteId,
  messagerieStorageKey,
  parseQuoteProposal,
  readImageAttachments,
  readStoredMessagerieFromServer,
  writeStoredMessagerie,
  type MessagerieAttachment,
  type MessagerieMessage,
  type MessagerieThread,
  type StoredMessagerie,
} from "@/src/lib/messagerieStorage";
import { readClientQuotes, writeClientQuotes, type ClientQuote } from "@/src/lib/clientProfileStorage";
import styles from "./MessageriePage.module.css";

const demoThreads: MessagerieThread[] = [
  {
    id: "projet-bras",
    name: "Bryan",
    project: "Avant-bras floral",
    lastMessage: "Je regarde tes références et je te fais un retour clair.",
    time: "10:42",
    status: "En étude",
    unread: 2,
  },
  {
    id: "flash-serpent",
    name: "Studio",
    project: "Flash serpent",
    lastMessage: "Le flash est toujours disponible.",
    time: "Hier",
    status: "Disponible",
  },
  {
    id: "retouche",
    name: "Bryan",
    project: "Suivi cicatrisation",
    lastMessage: "La cicatrisation a l'air propre, continue les soins.",
    time: "Ven.",
    status: "Suivi",
  },
];

const demoMessages: MessagerieMessage[] = [
  {
    id: "m1",
    threadId: "projet-bras",
    author: "studio",
    text: "Salut, j'ai bien reçu ta demande pour l'avant-bras floral. Tu peux m'envoyer deux ou trois références supplémentaires si tu veux préciser l'ambiance.",
    time: "10:18",
  },
  {
    id: "m2",
    threadId: "projet-bras",
    author: "client",
    text: "Oui, je cherche quelque chose de fin, pas trop chargé, avec une composition qui suit le bras.",
    time: "10:24",
    state: "read",
  },
  {
    id: "m3",
    threadId: "projet-bras",
    author: "studio",
    text: "Parfait. Je regarde tes références et je te fais un retour clair avec la taille conseillée, le placement et une première estimation.",
    time: "10:42",
  },
];

const quickReplies = [
  "Ajouter une référence",
  "Préciser la taille",
  "Envoyer mes disponibilités",
];

const markStudioMessagesAsRead = (messages: MessagerieMessage[], threadId: string) =>
  messages.map((message) =>
    message.threadId === threadId && message.author === "studio" && message.state !== "read"
      ? { ...message, state: "read" as const }
      : message,
  );

const getLatestQuoteProposal = (messages: MessagerieMessage[]) => {
  for (const message of [...messages].reverse()) {
    if (message.author !== "studio") continue;

    const proposal = parseQuoteProposal(message.text);
    if (proposal) {
      return { message, proposal };
    }
  }

  return null;
};

const hasQuoteDecisionAfter = (messages: MessagerieMessage[], proposalMessageId: string) => {
  const proposalIndex = messages.findIndex((message) => message.id === proposalMessageId);

  if (proposalIndex < 0) return false;

  return messages
    .slice(proposalIndex + 1)
    .some((message) => message.author === "client" && /^Devis (accepté|décliné)/i.test(message.text));
};

export default function MessagerieClient() {
  const [threads, setThreads] = useState<MessagerieThread[]>(demoThreads);
  const [activeThread, setActiveThread] = useState(demoThreads[0].id);
  const [messages, setMessages] = useState<MessagerieMessage[]>(demoMessages);
  const [draft, setDraft] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<MessagerieAttachment[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === activeThread) ?? threads[0],
    [activeThread, threads],
  );
  const threadMessages = useMemo(
    () => messages.filter((message) => message.threadId === selectedThread.id),
    [messages, selectedThread.id],
  );
  const quoteProposal = useMemo(() => getLatestQuoteProposal(threadMessages), [threadMessages]);
  const canAnswerQuoteProposal = Boolean(
    quoteProposal &&
      selectedThread.source === "devis" &&
      !hasQuoteDecisionAfter(threadMessages, quoteProposal.message.id),
  );
  const clientUnreadByThread = useMemo(() => {
    const counts = new Map<string, number>();

    messages.forEach((message) => {
      if (message.author === "studio" && message.state !== "read") {
        counts.set(message.threadId, (counts.get(message.threadId) ?? 0) + 1);
      }
    });

    return counts;
  }, [messages]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void (async () => {
      try {
        const serverMessagerie = await readStoredMessagerieFromServer();
        const stored = serverMessagerie
          ? JSON.stringify(serverMessagerie)
          : window.localStorage.getItem(messagerieStorageKey);

        if (!stored) {
          return;
        }

        const parsed = serverMessagerie ?? JSON.parse(stored) as Partial<StoredMessagerie>;
        const storedThreads = Array.isArray(parsed.threads) ? parsed.threads : [];
        const storedMessages = Array.isArray(parsed.messages) ? parsed.messages : [];

        if (!storedThreads.length || !storedMessages.length) {
          return;
        }

        const nextActiveThread = parsed.activeThreadId ?? storedThreads[0].id;
        const nextStoredMessages = markStudioMessagesAsRead(storedMessages, nextActiveThread);

        setThreads([...storedThreads, ...demoThreads]);
        setMessages([...nextStoredMessages, ...demoMessages]);
        setActiveThread(nextActiveThread);
        writeStoredMessagerie({
          activeThreadId: nextActiveThread,
          threads: storedThreads,
          messages: nextStoredMessages,
        });
      } catch {
        window.localStorage.removeItem(messagerieStorageKey);
      }
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const storedThreads = threads.filter((thread) => thread.source === "devis");
    const storedThreadIds = new Set(storedThreads.map((thread) => thread.id));

    if (!storedThreads.length) {
      return;
    }

    const storedMessages = messages.filter((message) => storedThreadIds.has(message.threadId));

    const storedMessagerie = {
      activeThreadId: activeThread,
      threads: storedThreads,
      messages: storedMessages,
    };

    writeStoredMessagerie(storedMessagerie);
  }, [activeThread, messages, threads]);

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text && !pendingAttachments.length) {
      return;
    }

    const now = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    const lastMessage = text || (pendingAttachments.length > 1 ? `${pendingAttachments.length} photos ajoutées` : "Photo ajoutée");

    const nextMessage: MessagerieMessage = {
      id: `local-${Date.now()}`,
      threadId: selectedThread.id,
      author: "client",
      attachments: pendingAttachments.length ? pendingAttachments : undefined,
      text,
      time: now,
      state: "sent",
    };

    setMessages((currentMessages) => [...currentMessages, nextMessage]);
    setThreads((currentThreads) =>
      currentThreads.map((thread) =>
        thread.id === selectedThread.id
          ? {
              ...thread,
              lastMessage,
              time: now,
              unread: (thread.unread ?? 0) + 1,
            }
          : thread,
      ),
    );
    setDraft("");
    setPendingAttachments([]);
  }

  async function addImages(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const attachments = await readImageAttachments(files);
    if (!attachments.length) {
      return;
    }

    setPendingAttachments((current) => [...current, ...attachments]);
  }

  function answerQuoteProposal(status: Extract<ClientQuote["status"], "Accepté" | "Refusé">) {
    if (!quoteProposal) return;

    const quoteId = getThreadQuoteId(selectedThread.id);
    const now = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    const text =
      status === "Accepté"
        ? `Devis accepté (${quoteProposal.proposal.total} €${quoteProposal.proposal.deposit ? ` dont ${quoteProposal.proposal.deposit} € d'acompte` : ""}).`
        : "Devis décliné.";
    const nextMessage: MessagerieMessage = {
      id: `quote-answer-${Date.now()}`,
      threadId: selectedThread.id,
      author: "client",
      text,
      time: now,
      state: "sent",
    };
    const nextMessages = [...messages, nextMessage];
    const nextThreads = threads.map((thread) =>
      thread.id === selectedThread.id
        ? {
            ...thread,
            lastMessage: text,
            status,
            time: now,
            unread: (thread.unread ?? 0) + 1,
          }
        : thread,
    );

    setMessages(nextMessages);
    setThreads(nextThreads);

    if (quoteId) {
      const nextQuotes = readClientQuotes().map((quote) =>
        quote.id === quoteId ? { ...quote, status } : quote,
      );

      writeClientQuotes(nextQuotes);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero} data-page-hero>
          <img
            className={styles.heroImage}
            src="/DFEEF94D-7BA4-4985-9823-CD269191360D.png"
            alt=""
            aria-hidden="true"
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={styles.heroVeil} aria-hidden="true" />

          <div data-page-hero-content>
            <div>
              <p data-page-brand>B.Grumpy</p>
              <p data-page-brand-sub>MESSAGERIE</p>
            </div>

            <div data-page-hero-copy>
              <h1 data-page-title>Messagerie</h1>
              <p data-page-intro>
                Suivez vos échanges, vos références et les prochaines étapes du projet.
              </p>
            </div>

            <div data-page-hero-badges aria-label="Qualités de la messagerie">
              <span>Suivi projet</span>
            </div>
          </div>
        </section>

        <section className={styles.searchBar} aria-label="Rechercher une conversation">
          <Search className={styles.searchIcon} strokeWidth={1.7} />
          <span>Rechercher un projet ou un message</span>
        </section>

        <section className={styles.layout} aria-label="Messagerie client">
          <aside className={styles.threadList} aria-label="Conversations">
            {threads.map((thread) => {
              const isActive = thread.id === activeThread;
              const unread = clientUnreadByThread.get(thread.id) ?? 0;
              const openThread = () => {
                setPendingAttachments([]);
                setMessages((currentMessages) => markStudioMessagesAsRead(currentMessages, thread.id));
                setActiveThread(thread.id);
              };

              return (
                <button
                  className={`${styles.threadButton} ${isActive ? styles.threadActive : ""}`}
                  key={thread.id}
                  type="button"
                  onClick={openThread}
                >
                  <span className={styles.avatar}>
                    <MessageSquareText className={styles.avatarIcon} strokeWidth={1.7} />
                  </span>
                  <span className={styles.threadContent}>
                    <span className={styles.threadTopline}>
                      <strong>{thread.project}</strong>
                      <span>{thread.time}</span>
                    </span>
                    <span className={styles.threadMeta}>{thread.status}</span>
                    <span className={styles.threadPreview}>{thread.lastMessage}</span>
                  </span>
                  {unread ? <span className={styles.unread}>{unread}</span> : null}
                </button>
              );
            })}
          </aside>

          <section className={styles.conversation} aria-label={selectedThread.project}>
            <header className={styles.conversationHeader}>
              <span className={styles.profileAvatar}>
                <UserRound className={styles.profileIcon} strokeWidth={1.7} />
              </span>
              <div>
                <p className={styles.conversationName}>{selectedThread.name}</p>
                <p className={styles.conversationProject}>{selectedThread.project}</p>
              </div>
              <span className={styles.statusPill}>
                <Clock3 className={styles.statusIcon} strokeWidth={1.7} />
                {selectedThread.status}
              </span>
            </header>

            <div className={styles.projectStrip}>
              <div>
                <p className={styles.stripLabel}>Prochaine étape</p>
                <p className={styles.stripText}>Validation des références et estimation du devis</p>
              </div>
              <span className={styles.stripStatus}>En attente studio</span>
            </div>

            <div className={styles.messages} aria-live="polite">
              {threadMessages.map((message) => {
                const proposal = message.author === "studio" ? parseQuoteProposal(message.text) : null;
                const isActiveProposal = quoteProposal?.message.id === message.id && canAnswerQuoteProposal;

                if (proposal) {
                  return (
                    <article className={styles.quoteProposal} key={message.id}>
                      <div>
                        <span>Proposition de devis</span>
                        <strong>{proposal.total} €</strong>
                        {proposal.deposit ? <p>{proposal.deposit} € d&apos;acompte</p> : null}
                      </div>
                      {isActiveProposal ? (
                        <div>
                          <button type="button" onClick={() => answerQuoteProposal("Accepté")}>
                            Accepter
                          </button>
                          <button type="button" onClick={() => answerQuoteProposal("Refusé")}>
                            Décliner
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                }

                return (
                  <article
                    className={`${styles.message} ${
                      message.author === "client" ? styles.messageClient : styles.messageStudio
                    }`}
                    key={message.id}
                  >
                    {message.attachments?.length ? (
                      <div className={styles.messageAttachments}>
                        {message.attachments.map((attachment) => (
                          <img src={attachment.url} alt={attachment.name} key={attachment.id} />
                        ))}
                      </div>
                    ) : null}
                    {message.text ? <p>{message.text}</p> : null}
                    <span className={styles.messageTime}>
                      {message.time}
                      {message.author === "client" ? (
                        <CheckCheck className={styles.readIcon} strokeWidth={1.75} aria-label="Envoyé" />
                      ) : null}
                    </span>
                  </article>
                );
              })}
            </div>

            <div className={styles.quickReplies} aria-label="Réponses rapides">
              {quickReplies.map((reply) => (
                <button
                  className={styles.quickReply}
                  key={reply}
                  type="button"
                  onClick={() => setDraft(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>

            <form className={styles.composer} onSubmit={sendMessage}>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(event) => {
                  void addImages(event.target.files);
                  event.target.value = "";
                }}
              />
              <button
                className={styles.iconButton}
                type="button"
                aria-label="Ajouter une image"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImagePlus className={styles.actionIcon} strokeWidth={1.7} />
              </button>
              <button className={styles.iconButton} type="button" aria-label="Joindre un fichier">
                <Paperclip className={styles.actionIcon} strokeWidth={1.7} />
              </button>
              <label className={styles.inputLabel}>
                <span>Message</span>
                {pendingAttachments.length ? (
                  <div className={styles.pendingAttachments}>
                    {pendingAttachments.map((attachment) => (
                      <span key={attachment.id}>
                        <img src={attachment.url} alt={attachment.name} />
                        <button
                          type="button"
                          aria-label={`Retirer ${attachment.name}`}
                          onClick={() =>
                            setPendingAttachments(pendingAttachments.filter((item) => item.id !== attachment.id))
                          }
                        >
                          <X strokeWidth={1.7} aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
                <textarea
                  className={styles.textarea}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Écrire un message..."
                  rows={1}
                />
              </label>
              <button className={styles.sendButton} type="submit" aria-label="Envoyer le message">
                <Send className={styles.sendIcon} strokeWidth={1.8} />
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}

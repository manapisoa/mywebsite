
import { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageCircle,
  Wifi,
  WifiOff,
  UserRound,
  CheckCheck,
} from "lucide-react";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const protocol =
      window.location.protocol === "https:" ? "wss:" : "ws:";

    const url = `${protocol}//localhost:8000/ws/socket-server/`;

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connecté");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setMessages((previousMessages) => [
          ...previousMessages,
          {
            id: `${Date.now()}-${Math.random()}`,
            text: data.message,
            sender: "other",
            time: new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } catch (error) {
        console.error("Erreur de lecture du message :", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket déconnecté");
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error("Erreur WebSocket :", error);
      setConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const text = message.trim();
    const socket = socketRef.current;

    if (!text || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    // Envoi au serveur Django Channels
    socket.send(
      JSON.stringify({
        message: text,
      })
    );

    // Affichage immédiat du message envoyé
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: `${Date.now()}-${Math.random()}`,
        text,
        sender: "me",
        time: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setMessage("");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-3xl h-[90vh] min-h-[500px] max-h-[850px] flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/30">

        {/* En-tête */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/30">
              <MessageCircle size={25} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                Chat App
              </h1>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <span
                  className={`h-2 w-2 rounded-full ${
                    connected
                      ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                      : "bg-red-400"
                  }`}
                />
                {connected ? "Connecté en temps réel" : "Déconnecté"}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${
              connected
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {connected ? <Wifi size={15} /> : <WifiOff size={15} />}
            <span className="hidden sm:inline">
              {connected ? "En ligne" : "Hors ligne"}
            </span>
          </div>
        </header>

        {/* Zone des messages */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 px-3 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-500/20 bg-violet-500/10">
                <MessageCircle
                  size={38}
                  className="text-violet-400"
                  strokeWidth={1.5}
                />
              </div>

              <h2 className="text-lg font-semibold text-slate-200">
                Bienvenue dans le chat !
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                {connected
                  ? "Ta connexion est prête. Envoie ton premier message pour commencer la conversation."
                  : "Connexion au serveur en cours..."}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-center">
                <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-500">
                  Messages de la conversation
                </span>
              </div>

              {messages.map((item) => {
                const isMe = item.sender === "me";

                return (
                  <div
                    key={item.id}
                    className={`flex items-end gap-2 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isMe && (
                      <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                        <UserRound size={17} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] break-words rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                        isMe
                          ? "rounded-br-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                          : "rounded-bl-md border border-slate-800 bg-slate-900 text-slate-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {item.text}
                      </p>

                      <div
                        className={`mt-2 flex items-center justify-end gap-1.5 text-[10px] ${
                          isMe ? "text-violet-200" : "text-slate-500"
                        }`}
                      >
                        <span>{item.time}</span>
                        {isMe && <CheckCheck size={14} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Formulaire d'envoi */}
        <footer className="border-t border-slate-800 bg-slate-900 p-3 sm:p-5">
          {!connected && (
            <p className="mb-3 text-center text-xs text-red-400">
              Impossible d'envoyer un message : serveur non connecté.
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 p-2 transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/10"
          >
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Écris ton message..."
              autoComplete="off"
              disabled={!connected}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={!connected || !message.trim()}
              aria-label="Envoyer le message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/30 transition hover:scale-105 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send size={19} />
            </button>
          </form>

          <p className="mt-3 text-center text-[11px] text-slate-600">
            Messagerie en temps réel · WebSocket
          </p>
        </footer>
      </div>
    </div>
  );
}


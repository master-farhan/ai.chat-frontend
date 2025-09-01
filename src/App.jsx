import React, { useState, useRef, useEffect } from "react";
import { IoSendSharp } from "react-icons/io5";
import { io } from "socket.io-client";
import dotenv from "dotenv";
dotenv.config();

// ✅ safer socket connection
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
});

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 h-6 pl-2">
      <span className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: "0s" }} />
      <span className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: ".2s" }} />
      <span className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: ".4s" }} />
    </div>
  );
}

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    socket.on("ai-response", (aiText) => {
      setMessages((msgs) => [...msgs, { role: "model", content: aiText }]);
      setLoading(false);
    });

    socket.on("connect_error", () => {
      setMessages((msgs) => [
        ...msgs,
        { role: "system", content: "⚠️ Cannot connect to server." },
      ]);
      setLoading(false);
    });

    return () => {
      socket.off("ai-response");
      socket.off("connect_error");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setInput("");
    setLoading(true);
    socket.emit("message", input);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 flex items-center px-4 bg-gray-800 z-20 shadow-md">
        <h1 className="text-lg font-bold">AI Chat</h1>
      </header>

      {/* Chat Area */}
      <main className="flex-1 pt-14 pb-24 overflow-y-auto w-full max-w-2xl mx-auto px-2">
        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.role === "user" ? "bg-gray-700 text-white rounded-l-2xl" : "bg-gray-200 text-gray-900 rounded-r-2xl"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-2 bg-gray-200">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Box */}
      <form
        className="fixed bottom-0 left-0 right-0 px-4 py-3 flex items-center gap-2 bg-gray-800 z-20"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          className="flex-1 rounded-full border border-gray-600 px-4 py-2 focus:outline-none text-white bg-gray-700 placeholder-gray-400 focus:border-gray-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-green-500 rounded-full px-3 py-2 active:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !input.trim()}
        >
          <IoSendSharp className="text-white text-lg" />
        </button>
      </form>
    </div>
  );
};

export default App;

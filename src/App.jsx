import React, { useState, useRef, useEffect } from "react";
import { IoSendSharp } from "react-icons/io5";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL);

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 h-6 pl-2">
      <span
        className="animate-bounce w-2 h-2 bg-gray-400 rounded-full"
        style={{ animationDelay: "0s" }}
      />
      <span
        className="animate-bounce w-2 h-2 bg-gray-400 rounded-full"
        style={{ animationDelay: ".2s" }}
      />
      <span
        className="animate-bounce w-2 h-2 bg-gray-400 rounded-full"
        style={{ animationDelay: ".4s" }}
      />
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
    // listen for ai responses from backend
    socket.on("ai-response", (aiText) => {
      setMessages((msgs) => [...msgs, { role: "ai", content: aiText }]);
      setLoading(false);
    });

    return () => {
      socket.off("ai-response");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };

    // update UI immediately
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    // send message to backend
    socket.emit("message", input);
  };

  return (
    <div className="flex flex-col h-screen pb-10 bg-back">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 flex items-center px-4 z-10">
        <h1 className="text-lg font-bold text-grow">AI Chat</h1>
      </header>

      {/* Chat Area */}
      <main className="flex-1 pt-14 pb-20 overflow-y-auto scroll-hidden w-full max-w-2xl mx-auto px-2">
        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-t-2xl ${
                  msg.role === "user"
                    ? "bg-gray-800 text-grow rounded-l-2xl"
                    : "text-grow rounded-r-2xl"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-2">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Box */}
      <form
        className="fixed bottom-5 left-1/2 right-0 -translate-x-1/2 px-4 py-3 flex items-center gap-2 w-full max-w-xl"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          className="flex-1 rounded-full border-[1px] border-grow/10 px-4 py-2 focus:outline-none text-grow focus:border-grow"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-grow rounded-full px-[12.5px] py-3  active:bg-grow/10 outline-none transition cursor-pointer"
          disabled={loading || !input.trim()}
        >
          <IoSendSharp className="text-back text-lg" />
        </button>
      </form>
    </div>
  );
};

export default App;

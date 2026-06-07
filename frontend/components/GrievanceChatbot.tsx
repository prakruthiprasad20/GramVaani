"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mic, Send, Square, User } from "lucide-react";
import api from "@/lib/api";

interface ChatMessage {
  sender: "bot" | "user";
  text: string;
}

export default function GrievanceChatbot({
  onSubmitted,
}: {
  onSubmitted: (g: any) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [chat, setChat] = useState<ChatMessage[]>([
    { sender: "bot", text: "Hello! I am your AI Grievance Assistant." },
    {
      sender: "bot",
      text: "Please describe the issue you are facing. You can type or use the mic.",
    },
  ]);

  const [description, setDescription] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [step, setStep] = useState<"ask" | "confirm" | "done">("ask");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat, loading]);

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setTranscribing(true);

      const formData = new FormData();
      formData.append("file", audioBlob, "speech.webm");

      const response = await fetch("http://127.0.0.1:8000/speech/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();

      setDescription((prev) => (prev ? `${prev} ${data.text}` : data.text));

      setChat((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `I converted your speech to English text. Detected language: ${data.detected_language || data.language || "unknown"}.`,
        },
      ]);
    } catch (error) {
      console.error("Transcription failed:", error);
      alert("Speech transcription failed. Please try again.");
    } finally {
      setTranscribing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Microphone access failed:", error);
      alert("Could not access microphone. Please allow microphone permission.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const sendMessage = async () => {
    if (!description.trim()) return;

    const userText = description.trim();

    setChat((prev) => [...prev, { sender: "user", text: userText }]);
    setDescription("");

    if (step === "ask") {
      setLoading(true);

      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          { sender: "bot", text: "Analyzing your issue..." },
        ]);
      }, 500);

      try {
        const res = await api.post("/ai/classify", { text: userText });
        const parsed = res.data;

        setAnalysis({ ...parsed, original: userText });

        setTimeout(() => {
          setChat((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `I've detected the following:\n\nCategory: **${parsed.category}**\nPriority: **${parsed.priority}**\nRegion: **${parsed.region}**`,
            },
            {
              sender: "bot",
              text: "Should I submit this grievance now? Type **Yes** or **No**.",
            },
          ]);

          setStep("confirm");
          setLoading(false);
        }, 1500);
      } catch (e) {
        console.error("Chatbot Error:", e);

        setChat((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "I couldn't analyze that. Could you try describing it differently?",
          },
        ]);

        setLoading(false);
      }

      return;
    }

    if (step === "confirm") {
      if (userText.toLowerCase().startsWith("y")) {
        setChat((prev) => [
          ...prev,
          { sender: "bot", text: "Submitting your grievance..." },
        ]);

        setLoading(true);

        try {
          const res = await api.post("/grievance/submit", {
            description: analysis.original,
          });

          onSubmitted(res.data);

          setChat((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "**Success!** Your grievance has been submitted.",
            },
            {
              sender: "bot",
              text: "You can see it in the list on the right. Would you like to report another issue?",
            },
          ]);

          setStep("ask");
        } catch (err) {
          console.error(err);

          setChat((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Something went wrong while submitting. Please try again.",
            },
          ]);

          setStep("ask");
        }

        setLoading(false);
      } else {
        setChat((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Okay, submission cancelled. Please describe the issue again.",
          },
        ]);

        setStep("ask");
      }
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-[600px] flex flex-col overflow-hidden">
      <div className="bg-blue-600 p-4 flex items-center gap-3 shadow-md">
        <div className="bg-white/20 p-2 rounded-full">
          <Bot className="text-white w-6 h-6" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">AI Assistant</h3>
          <p className="text-blue-100 text-xs">
            Speech-to-text enabled grievance assistant
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scroll-smooth"
      >
        <AnimatePresence>
          {chat.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-blue-600" />
                </div>
              )}

              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === "bot"
                    ? "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none"
                    : "bg-blue-600 text-white rounded-tr-none"
                }`}
              >
                <p
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\n/g, "<br/>")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                  }}
                />
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 items-center"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-blue-600" />
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700 flex gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2 items-center"
        >
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
            placeholder={
              transcribing
                ? "Converting speech to English..."
                : "Type your message or use the mic..."
            }
            disabled={loading || transcribing}
          />

          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={loading || transcribing}
            className={`p-3 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg dark:shadow-none ${
              recording
                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                : "bg-green-600 hover:bg-green-700 shadow-green-200"
            }`}
            title={recording ? "Stop recording" : "Start voice input"}
          >
            {recording ? <Square size={20} /> : <Mic size={20} />}
          </button>

          <button
            type="submit"
            disabled={loading || transcribing || !description.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
            title="Send"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
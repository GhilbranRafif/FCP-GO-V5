import React, { useState } from "react";
import axios from "axios";
import "./ServiceAI.css";

const ChatAssistantAI = () => {
  const [queryAssistant, setQueryAssistant] = useState(""); // Untuk Chat dengan Asisten AI

  const [assistantAIResponse, setAssistantAIResponse] = useState(""); // Respons untuk asisten AI

  const [loading, setLoading] = useState(false); // State untuk loading

  const handleAssistantChat = async () => {
    if (!queryAssistant.trim()) {
      alert("Please enter a question for the Assistant AI.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/chat", {
        query: queryAssistant,
        context: "User context here",
      });

      setAssistantAIResponse(response.data.answer);
    } catch (error) {
      console.error("Error chatting with AI:", error);
      setAssistantAIResponse("Terjadi kesalahan saat berkomunikasi dengan AI.");
      alert(
        "Error chatting with AI: " +
          (error.response ? error.response.data : error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-ai-container" style={{ height: "95vh" }}>
      <h1 className="main-title lexend-deca-bold">Chat With Assistant AI</h1>
      <p
        className="description lexend-deca-regular"
        style={{ textAlign: "center" }}
      >
        Saya menggunakan model AI Phi-3.5 sebagai Asisten AI yang dapat
        berkomunikasi <br></br>secara langsung dengan Pengguna
      </p>

      {/* Tambahan untuk input ChatHandler */}
      <div className="chat-handler">
        <h2>Apa yang bisa saya bantu ?</h2>
        <input
          type="text"
          value={queryAssistant}
          onChange={(e) => setQueryAssistant(e.target.value)}
          placeholder="Tanyakan sesuatu..."
        />
        <button
          className="outfit-reguler"
          onClick={handleAssistantChat}
          disabled={loading}
        >
          Kirim
        </button>
        {loading && <p>Loading...</p>} {/* Loading indicator */}
        <div className="chat-response">
          <h3>Respons AI</h3>
          <p>{assistantAIResponse}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistantAI;

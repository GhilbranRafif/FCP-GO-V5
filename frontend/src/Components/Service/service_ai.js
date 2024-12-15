import React, { useState, useRef } from "react";
import axios from "axios";
import "./ServiceAI.css";

const ServiceAI = () => {
  const [file, setFile] = useState(null);
  const [queryAI, setQueryAI] = useState(""); // Untuk Chat with AI
  const [queryAssistant, setQueryAssistant] = useState(""); // Untuk Chat dengan Asisten AI
  const [uploadResponse, setUploadResponse] = useState("");
  const [aiResponse, setAIResponse] = useState(""); // Respons untuk analisis data
  const [assistantAIResponse, setAssistantAIResponse] = useState(""); // Respons untuk asisten AI
  const [table, setTable] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false); // State untuk loading

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected");
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8080/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTable(res.data.table);
      setUploadResponse(res.data.message);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(
        "Error uploading file: " +
          (error.response ? error.response.data : error.message)
      );
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleChat = async () => {
    if (!table) {
      console.error("No table available for analysis");
      alert("Please upload a file and analyze it first.");
      return;
    }
    if (!queryAI.trim()) {
      alert("Please enter a question for the AI.");
      return;
    }

    setLoading(true); // Set loading state
    try {
      const res = await axios.post("http://localhost:8080/analyze", {
        table: table,
        query: queryAI,
      });
      setAIResponse(res.data.answer);
    } catch (error) {
      console.error(
        "Error querying chat:",
        error.response ? error.response.data : error.message
      );
      alert(
        "Error querying AI: " +
          (error.response ? error.response.data : error.message)
      );
    } finally {
      setLoading(false); // Reset loading state
    }
  };

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

      // Tambahkan debug console.log
      console.log("Full Response:", response);
      console.log("Response Data:", response.data);
      console.log("Answer:", response.data.answer);

      setAssistantAIResponse(response.data.answer);
    } catch (error) {
      console.error("Full Error Object:", error);
      console.error("Error Response:", error.response);

      // Tambahkan penanganan error yang lebih detail
      if (error.response) {
        console.error("Error Data:", error.response.data);
        console.error("Error Status:", error.response.status);
      }

      setAssistantAIResponse("Terjadi kesalahan saat berkomunikasi dengan AI.");
      alert(
        "Error chatting with AI: " +
          (error.response ? error.response.data : error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="service-ai-container">
      <h1 className="main-title outfit-reguler">Chat With Data</h1>
      <p className="description lexend-deca-regular">
        Supported by Tapas Model AI
      </p>
      <div className="sections-container">
        <div
          className="upload-section"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <h2>File Upload</h2>
          <div className="drop-area">
            <p>
              {file
                ? `Selected file: ${file.name}`
                : "Select a file or drag here"}
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <button className="outfit-reguler" onClick={openFileDialog}>
              Select a file
            </button>
            <button className="outfit-reguler" onClick={handleUpload}>
              Upload
            </button>
          </div>
          <div className="response">
            <h3>Upload Response</h3>
            <p>{uploadResponse}</p>
          </div>
        </div>
        <div className="chat-section">
          <h2>Chat with AI</h2>
          <p className="ai-description">
            AI ini akan menganalisa data melalui file yang kamu Upload dan
            menjawab berdasarkan data nya
          </p>
          <input
            type="text"
            value={queryAI}
            onChange={(e) => setQueryAI(e.target.value)}
            placeholder="Ask a question..."
          />
          <button
            className="outfit-reguler"
            onClick={handleChat}
            disabled={loading}
          >
            Send
          </button>
          {loading && <p>Loading...</p>} {/* Loading indicator */}
          <div className="chat-response">
            <h3>Response AI</h3>
            <p>{aiResponse}</p>
          </div>
        </div>
      </div>
      <div
        style={{
          margin: "10vh",
        }}
      ></div>
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

export default ServiceAI;

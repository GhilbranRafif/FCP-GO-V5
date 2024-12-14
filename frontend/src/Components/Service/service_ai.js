import React, { useState, useRef } from "react";
import axios from "axios";
import "./ServiceAI.css";

const ServiceAI = () => {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected");
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
      setResponse(res.data.message);
    } catch (error) {
      console.error("Error uploading file:", error);
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
    try {
      const res = await axios.post("http://localhost:8080/chat", { query });
      setResponse(res.data.answer);
    } catch (error) {
      console.error("Error querying chat:", error);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="service-ai-container">
      <div
        className="upload-section"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <h2>File Upload & Image Preview</h2>
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
            style={{ display: "none" }} // Sembunyikan input file
          />
          <button onClick={openFileDialog}>Select a file</button>
          <button onClick={handleUpload}>Upload</button>
        </div>
        <div className="response">
          <h3>Response</h3>
          <p>{response}</p>
        </div>
      </div>
      <div className="chat-section">
        <h2>Chat with AI</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
        />
        <button onClick={handleChat}>Send</button>
        <div className="chat-response">
          <h3>AI Response</h3>
          <p>{response}</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceAI;

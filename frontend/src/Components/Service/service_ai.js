import React, { useState, useRef } from "react";
import axios from "axios";
import "./ServiceAI.css";
import "./ApplianceUsage.css";

const ServiceAI = () => {
  const [file, setFile] = useState(null);
  const [queryAI, setQueryAI] = useState(""); // Untuk Chat with AI
  const [queryAssistant, setQueryAssistant] = useState(""); // Untuk Chat dengan Asisten AI
  const [uploadResponse, setUploadResponse] = useState("");
  const [aiResponse, setAIResponse] = useState(""); // Respons untuk analisis data
  const [assistantAIResponse, setAssistantAIResponse] = useState(""); // Respons untuk asisten AI
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(false); // State untuk loading
  const [electricityResponse, setElectricityResponse] = useState(""); // Respons untuk analisis konsumsi energi
  const fileInputRef = useRef(null);
  const [applianceUsage, setApplianceUsage] = useState([]); // State untuk menyimpan penggunaan alat

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
      // Panggil analisis konsumsi energi setelah upload berhasil
      await handleElectricityAnalysis(res.data.table);
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

  const handleElectricityAnalysis = async (uploadedTable) => {
    if (!uploadedTable) {
      alert("Please upload a file and analyze it first.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/electricity-consumption",
        {
          table: uploadedTable,
        }
      );
      setElectricityResponse(
        `Least Electricity: ${response.data.leastElectricity}, Most Electricity: ${response.data.mostElectricity}`
      );
      const usageData = calculateUsage(uploadedTable);
      setApplianceUsage(usageData);
    } catch (error) {
      console.error("Error analyzing electricity consumption:", error);
      alert(
        "Error analyzing electricity consumption: " +
          (error.response ? error.response.data : error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateUsage = (table) => {
    const usageMap = {};

    // Iterasi melalui data untuk menghitung jam penggunaan dan total konsumsi energi
    for (let i = 0; i < table["Appliance"].length; i++) {
      const appliance = table["Appliance"][i];
      const status = table["Status"][i];
      const energyConsumption = parseFloat(table["Energy_Consumption"][i]);

      if (!usageMap[appliance]) {
        usageMap[appliance] = { hours: 0, totalConsumption: 0 };
      }

      // Hitung jam penggunaan jika status "On"
      if (status === "On") {
        usageMap[appliance].hours += 1; // Asumsikan setiap entri adalah satu jam
        // Tambahkan konsumsi energi hanya jika status "On"
        usageMap[appliance].totalConsumption += energyConsumption;
      }
    }

    // Ubah format menjadi array untuk ditampilkan
    return Object.entries(usageMap).map(([appliance, data]) => ({
      appliance,
      hours: data.hours,
      totalConsumption: data.totalConsumption,
    }));
  };

  const ApplianceUsageCard = ({ appliance, hours, totalConsumption }) => {
    const roundedConsumption = totalConsumption.toFixed(2);
    return (
      <div className="appliance-usage-card">
        <h3>{appliance}</h3>
        <p>Aktif Selama: {hours} Jam</p>
        <p>Total Pemakaian: {roundedConsumption} kWh</p>
      </div>
    );
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
      <h1 className="main-title lexend-deca-bold">Smart Home Data Summary</h1>
      <div className="separator"></div>

      {/* Respons untuk analisis konsumsi energi */}
      <div className="appliance-usage">
        {applianceUsage.length > 0 ? (
          <div className="appliance-usage-list">
            {applianceUsage.map((usage, index) => (
              <ApplianceUsageCard
                key={index}
                appliance={usage.appliance}
                hours={usage.hours}
                totalConsumption={usage.totalConsumption}
              />
            ))}
          </div>
        ) : (
          <div className="no-data-message">
            <i className="fas fa-exclamation-circle"></i>{" "}
            {/* Ikon dari Font Awesome */}
            <h3>Tidak ada data penggunaan alat.</h3>
            <p>Silakan upload file untuk melihat informasi penggunaan alat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceAI;

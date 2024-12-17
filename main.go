package main

import (
	"encoding/json"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"

	"a21hc3NpZ25tZW50/service"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

// Initialize the services
var fileService = &service.FileService{}
var aiService = &service.AIService{Client: &http.Client{}}
var store = sessions.NewCookieStore([]byte("my-key"))

func getSession(r *http.Request) *sessions.Session {
	session, _ := store.Get(r, "chat-session")
	return session
}

func main() {
	// Load the .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Retrieve the Hugging Face token from the environment variables
	token := os.Getenv("HUGGINGFACE_TOKEN")
	if token == "" {
		log.Fatal("HUGGINGFACE_TOKEN is not set in the .env file")
	}

	// Set up the router
	router := mux.NewRouter()

	// File upload endpoint
	router.HandleFunc("/upload", uploadHandler).Methods("POST")

	// New analyze endpoint for AI
	router.HandleFunc("/analyze", analyzeHandler).Methods("POST")

	// New chat endpoint for AI
	router.HandleFunc("/chat", chatHandler).Methods("POST")

	// New endpoint for analyzing electricity consumption
	router.HandleFunc("/electricity-consumption", electricityConsumptionHandler).Methods("POST")

	// Enable CORS
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"}, // Allow your React app's origin
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	}).Handler(router)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}

// Handler for file upload
func uploadHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Unable to retrieve file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fileContent, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Unable to read file", http.StatusInternalServerError)
		return
	}

	// Process file to get the table
	table, err := fileService.ProcessFile(string(fileContent))
	if err != nil {
		http.Error(w, "Unable to process file", http.StatusInternalServerError)
		return
	}

	// Send response with the table
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "File processed successfully.",
		"table":   table, // Kirim tabel sebagai bagian dari respons
	})
}

// New analyze handler
func analyzeHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Table map[string][]string `json:"table"`
		Query string              `json:"query"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Unable to parse request", http.StatusBadRequest)
		return
	}

	// Panggil fungsi AnalyzeData dari AIService
	response, err := aiService.AnalyzeData(request.Table, request.Query, os.Getenv("HUGGINGFACE_TOKEN"))
	if err != nil {
		http.Error(w, "Error analyzing data", http.StatusInternalServerError)
		return
	}

	// Kirim respons
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"answer": response})
}

// New handler for electricity consumption analysis
func electricityConsumptionHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Table map[string][]string `json:"table"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Unable to parse request", http.StatusBadRequest)
		return
	}

	// Panggil fungsi analyzeElectricityConsumption
	leastElectricity, mostElectricity := analyzeElectricityConsumption(request.Table)

	// Kirim respons
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"leastElectricity": leastElectricity,
		"mostElectricity":  mostElectricity,
	})
}

// New chat handler
func chatHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Query   string `json:"query"`
		Context string `json:"context"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	token := os.Getenv("HUGGINGFACE_TOKEN")

	response, err := aiService.ChatWithAI(request.Context, request.Query, token)
	if err != nil {
		log.Printf("Error calling AI service: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"answer": response})
}

// Function to analyze electricity consumption
func analyzeElectricityConsumption(table map[string][]string) (string, string) {
	// Create a map to store total energy consumption per appliance
	energyMap := make(map[string]float64)

	// Iterate through the data to calculate total energy consumption
	for i, appliance := range table["Appliance"] {
		energyStr := table["Energy_Consumption"][i]
		energyValue, err := strconv.ParseFloat(energyStr, 64) // Ensure this is float64
		if err != nil {
			log.Printf("Error parsing energy consumption for %s: %v", appliance, err)
			continue // Skip this entry if there's an error
		}
		energyMap[appliance] += energyValue
	}

	// Initialize variables to store the appliance with the highest and lowest energy consumption
	var leastElectricity, mostElectricity string
	var minConsumption, maxConsumption float64
	minConsumption = math.MaxFloat64 // Set initial minimum value to maximum float64

	// Find the appliance with maximum and minimum energy consumption
	for appliance, consumption := range energyMap {
		if consumption < minConsumption {
			minConsumption = consumption
			leastElectricity = appliance
		}
		if consumption > maxConsumption {
			maxConsumption = consumption
			mostElectricity = appliance
		}
	}

	return leastElectricity, mostElectricity
}

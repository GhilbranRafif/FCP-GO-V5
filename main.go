package main

import (
	"encoding/json"
	"fmt"
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

	// Chat endpoint
	router.HandleFunc("/chat", chatHandler).Methods("POST")

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

	// Perform manual analysis to find the appliance with the highest and lowest electricity consumption
	leastElectricity, mostElectricity := analyzeElectricityConsumption(table)

	// Format output
	output := fmt.Sprintf("From the provided data, here are the Least Electricity: %s and the Most Electricity: %s.", leastElectricity, mostElectricity)

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": output})
}

// Handler for chat
func chatHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Query string `json:"query"` // Correct JSON tag
	}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get the context from the session
	session := getSession(r)
	context, ok := session.Values["context"].(string) // Ensure type conversion
	if !ok {
		context = ""
	}

	response, err := aiService.ChatWithAI(context, request.Query, os.Getenv("HUGGINGFACE_TOKEN"))
	if err != nil {
		http.Error(w, "Unable to chat with AI", http.StatusInternalServerError)
		return
	}

	// Save the context to the session
	session.Values["context"] = response.GeneratedText
	session.Save(r, w)

	chatResponse := map[string]string{
		"status": "success",
		"answer": response.GeneratedText,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(chatResponse)
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
			continue
		}
		energyMap[appliance] += energyValue
	}

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

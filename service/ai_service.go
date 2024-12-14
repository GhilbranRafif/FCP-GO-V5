package service

import (
	"a21hc3NpZ25tZW50/model"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
)

type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

type AIService struct {
	Client HTTPClient
}

func (s *AIService) AnalyzeData(table map[string][]string, query, token string) (string, error) {
	if len(table) == 0 {
		return "", errors.New("table is empty")
	}

	input := model.AIRequest{
		Inputs: model.Inputs{
			Table: table,
			Query: query,
		},
	}

	modelUrl := "https://api-inference.huggingface.co/models/google/tapas-base-finetuned-wtq"
	reqBody, err := json.Marshal(input)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", modelUrl, bytes.NewReader(reqBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API returned error: %s", resp.Status)
	}

	var response model.TapasResponse
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		return "", err
	}

	return response.Cells[0], nil
}

func (s *AIService) ChatWithAI(query, token string) (string, error) {
	log.Printf("Received query: %s", query)

	// Modify the request body to match the expected format
	requestBody := map[string]interface{}{
		"inputs": query, // Change this to send query directly as a string
		"parameters": map[string]interface{}{
			"max_new_tokens": 512,
			"stream":         false,
		},
	}

	reqBody, err := json.Marshal(requestBody)
	if err != nil {
		log.Printf("Error marshaling request body: %v", err)
		return "", err
	}

	log.Printf("Request Body: %s", string(reqBody))

	modelUrl := "https://api-inference.huggingface.co/models/Qwen/QwQ-32B-Preview"
	req, err := http.NewRequest("POST", modelUrl, bytes.NewReader(reqBody))
	if err != nil {
		log.Printf("Error creating request: %v", err)
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		log.Printf("Error making request to AI model: %v", err)
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("API returned error: %s, Body: %s", resp.Status, body)
		return "", fmt.Errorf("API returned error: %s, Body: %s", resp.Status, body)
	}

	// Modify the response parsing based on the actual response structure
	var response []struct {
		Generated_text string `json:"generated_text"`
	}

	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		log.Printf("Error decoding response: %v", err)
		return "", err
	}

	if len(response) == 0 {
		return "", errors.New("no response from AI model")
	}

	return response[0].Generated_text, nil
}

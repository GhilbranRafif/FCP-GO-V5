package service

import (
	"a21hc3NpZ25tZW50/model"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)

type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

type AIService struct {
	Client HTTPClient
}
type ChatResponse struct {
	Choices []struct {
		Message string `json:"message"`
	} `json:"choices"`
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

func (s *AIService) ChatWithAI(context, query, token string) (string, error) {
	modelUrl := "https://api-inference.huggingface.co/models/microsoft/Phi-3.5-mini-instruct"

	// Buat payload sesuai format yang diharapkan
	payload := map[string]interface{}{
		"inputs": query, // Gunakan query langsung sebagai input
		"parameters": map[string]interface{}{
			"max_new_tokens":   500,
			"return_full_text": false,
		},
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", modelUrl, bytes.NewBuffer(jsonPayload))
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
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API returned error: %s, body: %s", resp.Status, string(bodyBytes))
	}

	// Ubah struktur respons untuk menangani format model
	var responses []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&responses); err != nil {
		return "", fmt.Errorf("error decoding response: %v", err)
	}

	if len(responses) > 0 && responses[0]["generated_text"] != nil {
		return responses[0]["generated_text"].(string), nil
	}

	return "", errors.New("no valid response from AI model")
}

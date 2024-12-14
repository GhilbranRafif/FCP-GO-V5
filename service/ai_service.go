package service

import (
	"a21hc3NpZ25tZW50/model"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
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

func (s *AIService) ChatWithAI(context, query, token string) (model.ChatResponse, error) {
	requestBody := map[string]interface{}{
		"inputs": query,
	}

	reqBody, err := json.Marshal(requestBody)
	if err != nil {
		return model.ChatResponse{}, err
	}

	modelUrl := "https://api-inference.huggingface.co/models/microsoft/Phi-3.5-mini-instruct"
	req, err := http.NewRequest("POST", modelUrl, bytes.NewReader(reqBody))
	if err != nil {
		return model.ChatResponse{}, err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		return model.ChatResponse{}, err
	}
	defer resp.Body.Close()

	var response []model.ChatResponse // array, karena API mengembalikan array
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		return model.ChatResponse{}, err
	}

	return response[0], nil
}

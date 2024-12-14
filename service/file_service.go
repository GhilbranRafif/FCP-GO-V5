package service

import (
	repository "a21hc3NpZ25tZW50/repository/fileRepository"
	"encoding/csv"
	"errors"
	"strings"
)

type FileService struct {
	Repo *repository.FileRepository
}

func (s *FileService) ProcessFile(fileContent string) (map[string][]string, error) {
	if fileContent == "" {
		return nil, errors.New("CSV file is empty")
	}

	r := csv.NewReader(strings.NewReader(fileContent))
	records, err := r.ReadAll()
	if err != nil {
		return nil, err
	}

	if len(records) < 2 {
		return nil, errors.New("CSV file is missing header row")
	}

	table := make(map[string][]string)
	headers := records[0]

	for _, record := range records[1:] {
		if len(record) != len(headers) {
			return nil, errors.New("CSV file failed to process")
		}

		for i, header := range headers {
			table[header] = append(table[header], record[i])
		}
	}

	return table, nil
}

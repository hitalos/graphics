package main

import (
	"encoding/csv"
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type record struct {
	Date       string `json:"date"`
	State      string `json:"state"`
	Confirmed  string `json:"confirmed"`
	Deaths     string `json:"deaths"`
	Population string `json:"population"`
	IBGE       string `json:"ibge_code"`
}

func csvToJson(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	f, err := os.Open("cases.csv")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println(err)

		return
	}

	list, err := csv.NewReader(f).ReadAll()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println(err)

		return
	}

	records := []record{}
	for row, l := range list {
		if row == 0 {
			continue
		}
		records = append(records,
			record{
				Date:       l[0],
				State:      l[1],
				Confirmed:  l[2],
				Deaths:     l[3],
				Population: l[4],
				IBGE:       l[5],
			})
	}

	if err = json.NewEncoder(w).Encode(records); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println(err)

		return
	}
}

func main() {
	h := http.FileServer(http.Dir("./"))
	mux := http.NewServeMux()
	mux.HandleFunc("/cases.json", csvToJson)

	mux.Handle("/", h)

	http.ListenAndServe(":8000", mux)
}

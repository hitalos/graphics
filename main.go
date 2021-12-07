package main

import (
	"encoding/csv"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"
)

type record struct {
	Date       string `json:"date"`
	State      string `json:"state"`
	Confirmed  string `json:"confirmed"`
	Deaths     string `json:"deaths"`
	Population string `json:"population"`
	IBGE       string `json:"ibge_code"`
}

func csvToJson(w io.Writer, r io.Reader) error {
	list, err := csv.NewReader(r).ReadAll()
	if err != nil {
		return err
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

	return json.NewEncoder(w).Encode(records)
}

func getJSON(csvfile string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		f, err := os.Open(csvfile)
		if err != nil {
			return
		}
		defer f.Close()

		w.Header().Set("Content-Type", "application/json")

		if err := csvToJson(w, f); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)

			return
		}
	}
}

func loadValue(command string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cmd := exec.Command("sh", "-c", command)

		output, err := cmd.Output()
		if err != nil {
			log.Println(err)

			return
		}

		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(output)
	}
}

func logger(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t := time.Now()
		h.ServeHTTP(w, r)
		log.Println(r.Method, r.URL.Path, time.Since(t))
	})
}

func main() {
	h := http.FileServer(http.Dir("./"))
	mux := http.NewServeMux()
	mux.HandleFunc("/cases.json", getJSON("cases.csv"))

	if len(os.Args) > 1 {
		mux.HandleFunc("/sensors.json", loadValue(os.Args[1]))
	}

	mux.Handle("/", h)

	log.Println("Listening on http://0.0.0.0:8000")
	if err := http.ListenAndServe(":8000", logger(mux)); err != nil {
		log.Fatalln(err)
	}
}

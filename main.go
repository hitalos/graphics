package main

import (
	"encoding/csv"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type record struct {
	Date       string `json:"date"`
	State      string `json:"state"`
	Confirmed  uint64 `json:"confirmed"`
	Deaths     uint64 `json:"deaths"`
	Population uint64 `json:"population"`
	IBGE       uint64 `json:"ibge_code"`
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
		confirmed, _ := strconv.ParseUint(l[2], 10, 64)
		deaths, _ := strconv.ParseUint(l[3], 10, 64)
		population, _ := strconv.ParseUint(l[4], 10, 64)
		ibge, _ := strconv.ParseUint(l[5], 10, 64)
		records = append(records,
			record{
				Date:       l[0],
				State:      l[1],
				Confirmed:  confirmed,
				Deaths:     deaths,
				Population: population,
				IBGE:       ibge,
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

func main() {
	r := chi.NewRouter()
	r.Use(
		middleware.Logger,
		middleware.NewCompressor(6, "application/json", "text/*").Handler,
		allowedHosts([]string{"0.0.0.0:8000"}),
	)

	r.Get("/cases.json", getJSON("cases.csv"))

	if len(os.Args) > 1 {
		r.Get("/sensors.json", loadValue(os.Args[1]))
	}

	r.Handle("/*", http.FileServer(http.Dir("./")))

	s := http.Server{
		Addr:         ":8000",
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  10 * time.Second,
	}

	log.Println("Listening on http://0.0.0.0:8000")
	if err := s.ListenAndServe(); err != nil {
		log.Fatalln(err)
	}
}

func allowedHosts(hosts []string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			for _, host := range hosts {
				if r.Host == host {
					next.ServeHTTP(w, r)
					return
				}
			}

			http.Error(w, http.StatusText(http.StatusForbidden), http.StatusForbidden)
		})
	}
}

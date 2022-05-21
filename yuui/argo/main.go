package main

import (
	"log"
	"net/http"
)

const address = ":8080"
const path = "./public"

func main() {
	log.Printf("serving " + path + " on " + address)
	log.Fatal(http.ListenAndServe(address,
		http.FileServer(http.Dir(path)),
	))
}

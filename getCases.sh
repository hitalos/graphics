#!/bin/bash
URL='https://data.brasil.io/dataset/covid19/caso.csv.gz'

# TEMP=$(mktemp)

echo 'date,state,confirmed,deaths,population,ibge_code' > cases.csv
curl -sS "$URL" | gzip -d | awk 'BEGIN { FS=","; OFS="," } { if ($4 == "state" && $8 == "True") print $1,$2,$5,$6,$10,$11 }' >> cases.csv

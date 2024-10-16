#!/bin/bash

# Job Crawler
# Port: 3001

# Job Crawler Server
# Port: 5001

# Data Server
# Port: 5002

# Job Finder
# Port: 3000

# CI Backend
# Port: 3004

# Funktion zum Überprüfen, ob ein Port verwendet wird, mit maximalem Timeout von 30 Sekunden
wait_for_port_with_timeout() {
    local PORT=$1
    local TIMEOUT=30  # Timeout in Sekunden
    local COUNTER=0

    while ! nc -z localhost $PORT; do
        echo "Warte, bis Port $PORT verfügbar ist..."
        sleep 1
        ((COUNTER++))

        if [ $COUNTER -ge $TIMEOUT ]; then
            echo "Timeout erreicht: Port $PORT nach $TIMEOUT Sekunden nicht verfügbar. Führe fort..."
            break
        fi
    done

    echo "Weiter nach Timeout oder Port-Verfügbarkeit für $PORT."
}

# Funktion zum Starten der verschiedenen Dienste
start_job_crawler() {
    echo "Starte Job Crawler auf Port 3001..."
    (cd job-crawler/frontend && npm start) &
    wait_for_port_with_timeout 3001
}

start_job_crawler_server() {
    echo "Starte Job Crawler Server auf Port 5001..."
    (cd job-crawler/backend && npm start) &
    wait_for_port_with_timeout 5001
}

start_data_server() {
    echo "Starte Data Server auf Port 5002..."
    (cd matching-alg/ci-backend && npm start) &
    wait_for_port_with_timeout 5002
}

start_job_finder() {
    echo "Starte Job Finder auf Port 3000..."
    (cd matching-alg/frontend && npm start) &
    wait_for_port_with_timeout 3000
}

start_ci_backend() {
    echo "Starte CI Backend auf Port 3004..."
    (cd matching-alg/ci-frontend && npm start) &
    wait_for_port_with_timeout 3004
}

# Auswahlmenü für verschiedene Optionen
echo "Bitte wählen Sie eine Option:"
echo "1. Nur Job Crawler starten (Job Crawler und Job Crawler Server)"
echo "2. Nur Finder (Data Server und Job Finder)"
echo "3. Nur CI Backend (Data Server und CI Backend)"
echo "4. Kompletter Finder (Data Server, Job Finder und CI Backend)"
echo "5. Alles starten"
read -p "Ihre Auswahl: " option

case $option in
    1)
        start_job_crawler
        start_job_crawler_server
        ;;
    2)
        start_data_server
        start_job_finder
        ;;
    3)
        start_data_server
        start_ci_backend
        ;;
    4)
        start_data_server
        start_job_finder
        start_ci_backend
        ;;
    5)
        start_job_crawler
        start_job_crawler_server
        start_data_server
        start_job_finder
        start_ci_backend
        ;;
    *)
        echo "Ungültige Auswahl. Bitte wählen Sie eine Option von 1 bis 5."
        ;;
esac

# Warten auf Beendigung aller Hintergrundprozesse
wait

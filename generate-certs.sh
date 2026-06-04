#!/bin/bash
# generate-certs.sh
# Generates a self-signed SSL certificate for the calculator app
# Run this script from the project root directory

set -e

CERT_DIR="./certs"
DOMAIN="ec2-54-90-85-114.compute-1.amazonaws.com"

# Create certs directory if it doesn't exist
mkdir -p "$CERT_DIR"

echo "Generating self-signed SSL certificate for: $DOMAIN"

openssl req -x509 \
  -nodes \
  -days 365 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.crt" \
  -subj "/C=US/ST=State/L=City/O=Calculator/OU=Dev/CN=$DOMAIN" \
  -addext "subjectAltName=DNS:$DOMAIN,DNS:localhost,IP:54.90.85.114"

echo ""
echo "Certificate generated successfully!"
echo "  Key:  $CERT_DIR/server.key"
echo "  Cert: $CERT_DIR/server.crt"
echo ""
echo "To use with Docker Compose:"
echo "  docker-compose up --build"
echo ""
echo "Access the app at: https://$DOMAIN"
echo "(Your browser will warn about the self-signed cert - click 'Advanced' > 'Proceed')"

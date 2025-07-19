#!/bin/bash
# Test script for Fixa Voice Agent Observability Platform

# Text styling
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Timestamp for the test call
TIMESTAMP=$(date +%s)
TEST_CALL_ID="test-call-$TIMESTAMP"
SERVER_URL="http://localhost:3000"  # Updated to port 3003
API_KEY="fx-fba279c1-4045-4dc2-8252-f7d2094156a6"

echo -e "${BOLD}Fixa Voice Agent Observability Platform - Integration Test${NC}"
echo "======================================================"
echo -e "${YELLOW}Testing server at:${NC} $SERVER_URL"
echo -e "${YELLOW}Using API key:${NC} $API_KEY"
echo -e "${YELLOW}Test call ID:${NC} $TEST_CALL_ID"
echo "======================================================"

# Test 1: Server Health Check
echo -e "\n${BOLD}Test 1: Server Health Check${NC}"
HEALTH_RESPONSE=$(curl -s $SERVER_URL/health || echo "Failed to connect")

if [[ "$HEALTH_RESPONSE" == *"status"*"ok"* ]]; then
  echo -e "${GREEN}✓ Server is healthy${NC}"
else
  echo -e "${RED}✗ Server health check failed${NC}"
  echo "Response: $HEALTH_RESPONSE"
fi

# Test 2: Upload Call API
echo -e "\n${BOLD}Test 2: Upload Call API${NC}"
echo "Sending test call with ID: $TEST_CALL_ID"

UPLOAD_RESPONSE=$(curl -s --request POST \
  --url "$SERVER_URL/v1/upload-call" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $API_KEY" \
  --data '{
    "callId": "'$TEST_CALL_ID'",
    "agentId": "agent-1",
    "stereoRecordingUrl": "tenxrvoiceairecordings/livekit/recordings/rooms/0ff22875-abb5-4d70-b86e-fdaac0d32424/0ff22875-abb5-4d70-b86e-fdaac0d32424-2025-07-14_04-52-41.mp4"
  }')

if [[ "$UPLOAD_RESPONSE" == *"success"*"true"* ]]; then
  echo -e "${GREEN}✓ Call upload successful${NC}"
  echo "Response: $UPLOAD_RESPONSE"
else
  echo -e "${RED}✗ Call upload failed${NC}"
  echo "Response: $UPLOAD_RESPONSE"
fi

# Test 3: Check for call recording file
echo -e "\n${BOLD}Test 3: Check for Call Recording${NC}"
echo "Waiting 5 seconds for processing..."
sleep 5

# Attempt to find the recording file
FILE_CHECK_RESPONSE=$(curl -s -I "$SERVER_URL/files/calls/$TEST_CALL_ID.wav" || echo "Failed to connect")

if [[ "$FILE_CHECK_RESPONSE" == *"200 OK"* ]]; then
  echo -e "${GREEN}✓ Call recording file is accessible${NC}"
else
  echo -e "${YELLOW}⚠ Call recording not found at expected location${NC}"
  echo "Note: This may be expected if processing is still ongoing or if the file is saved with a different name"
  echo "Response: $FILE_CHECK_RESPONSE"
  
  # Try to list available files
  echo -e "\n${YELLOW}Checking for any .wav files in the calls directory...${NC}"
  FILES_RESPONSE=$(curl -s "$SERVER_URL/files/calls/" || echo "Failed to connect")
  
  if [[ "$FILES_RESPONSE" == *".wav"* ]]; then
    echo -e "${GREEN}Found WAV files in the calls directory:${NC}"
    echo "$FILES_RESPONSE" | grep -o '[^<>]*\.wav[^<>]*' | head -5
  else
    echo -e "${RED}No WAV files found in the calls directory${NC}"
  fi
fi

echo -e "\n${BOLD}Integration Test Complete${NC}"
echo "======================================================"
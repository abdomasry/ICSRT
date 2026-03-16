#!/bin/bash
# Production Deployment Checklist for ICSRT
# Run this before deploying to production

echo "=========================================="
echo "ICSRT Production Deployment Checklist"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "   Creating .env from template..."
    cp .env.example .env 2>/dev/null || touch .env
fi

echo "Checking environment variables..."
echo ""

# Function to check variable
check_var() {
    local var_name=$1
    local var_value=$(grep "^$var_name=" .env | cut -d '=' -f2)
    
    if [ -z "$var_value" ] || [ "$var_value" = "your-email@gmail.com" ] || [ "$var_value" = "your-app-password-here" ] || [ "$var_value" = "" ]; then
        echo -e "${RED}❌ $var_name${NC} - Not configured"
        return 1
    else
        echo -e "${GREEN}✅ $var_name${NC} - Configured"
        return 0
    fi
}

# Check critical variables
all_good=true

echo "1. Email Configuration:"
check_var "EMAIL_USER" || all_good=false
check_var "EMAIL_PASS" || all_good=false
echo ""

echo "2. Database Configuration:"
check_var "MONGODB_URI" || all_good=false
echo ""

echo "3. Security Configuration:"
check_var "JWT_SECRET" || all_good=false
echo ""

echo "4. Payment Configuration (Optional):"
check_var "PAYMOB_API_KEY" || echo -e "${YELLOW}⚠️  PAYMOB_API_KEY${NC} - Not configured (optional)"
check_var "PAYMOB_IFRAME_ID" || echo -e "${YELLOW}⚠️  PAYMOB_IFRAME_ID${NC} - Not configured (optional)"
echo ""

# Summary
echo "=========================================="
if [ "$all_good" = true ]; then
    echo -e "${GREEN}✅ All critical variables configured!${NC}"
    echo ""
    echo "Ready for production deployment:"
    echo "1. Upload .env file to production server"
    echo "2. Ensure .env is in same directory as server.js"
    echo "3. Restart Node.js application"
    echo "4. Verify email works: node test-email.js"
else
    echo -e "${RED}❌ Some critical variables are missing!${NC}"
    echo ""
    echo "To configure:"
    echo "1. Run: node setup-email.js (for email)"
    echo "2. Or manually edit .env file"
    echo "3. Re-run this checklist: ./deployment-checklist.sh"
fi
echo "=========================================="

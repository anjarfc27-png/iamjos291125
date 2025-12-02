# Test Login Script

# Test Editor Login
echo "Testing Editor Login..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"editor@example.com","password":"password"}' \
  -c cookies.txt

echo -e "\n\nTesting Editor Dashboard Access..."
curl -X GET http://localhost:3000/editor \
  -b cookies.txt \
  -L -v

echo -e "\n\nTesting Admin Login..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies-admin.txt

echo -e "\n\nTesting Admin Dashboard Access..."
curl -X GET http://localhost:3000/admin \
  -b cookies-admin.txt \
  -L -v
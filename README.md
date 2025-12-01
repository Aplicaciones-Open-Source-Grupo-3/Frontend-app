# Easy Park front-end

# To start the development application, follow these steps:

# Link to the back-end repository:
# Production (Render): https://easypark-platform.onrender.com
# Development (Local): http://localhost:8080

**Backend URL Configuration:**
- Production: `apiUrl: 'https://easypark-platform.onrender.com'`
- Local Development: `apiUrl: 'http://localhost:8080'`

**Important:** The backend must have CORS configured to allow requests from:
- https://easypark24.netlify.app (Production)
- http://localhost:4200 (Development)

# 1 Install dependencies
```shell
  npm install
```

# 2 Initialize the local mock server (optional for testing)
```shell
  cd server
  json-server --watch db.json
```

# 3 Run the application
```shell
  ng serve
```

# Deployment
- Frontend is automatically deployed to Netlify from `develop` branch
- Backend is deployed to Render at: https://easypark-platform.onrender.com
- Database is hosted on Clever Cloud

## Troubleshooting

### CORS Error
If you get a CORS error, make sure the backend has CORS properly configured to allow requests from your Netlify domain.

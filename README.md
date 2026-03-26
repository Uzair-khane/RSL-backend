# Admin Panel
# WEB-SERVER BACKEND
This is Web Server Backend application.

## Project setup

#### NodeJs Server > Go to: `your_directory`

#### Create .env file (if not exist) from .env.sample
```
npm install
```

### Compiles and hot-reloads for development
```
nodemon app.js
```
### Make sure your MySql server is running

## Run with Docker

1. Build and start:
```
docker compose up --build -d
```

2. See logs:
```
docker compose logs -f app
docker compose logs -f mysql
```

3. Stop:
```
docker compose down
```

Notes:
- App runs at `http://localhost:5000`
- MySQL is exposed on host port `3307` (container port `3306`)
- SQL dump at `db_dump/taxiapp_db.sql` auto-imports on first MySQL startup
- Docker env is in `.env.docker`

## Comments

#### Test
```
Mocha runs tests in the 'test' folder by default
```


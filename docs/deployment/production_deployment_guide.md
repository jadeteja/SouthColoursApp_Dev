# Southcolours — Production Deployment & Build Runbook

## 1. System Architecture Summary
```text
                     +---------------------------------+
                     |   Southcolours Customer App     |
                     |       (Android / Expo)          |
                     +----------------+----------------+
                                      |
                     +----------------+----------------+
                     |    Southcolours Admin App       |
                     |       (Android / Expo)          |
                     +----------------+----------------+
                                      | HTTPS
                                      v
                        +---------------------------+
                        |  Reverse Proxy (Nginx)    |
                        +-------------+-------------+
                                      | HTTP
                                      v
                        +---------------------------+
                        |   Spring Boot 3 Backend   |
                        |       (Java 21 LTS)       |
                        +------+-------------+------+
                               |             |
                               v             v
                    +--------------+   +-------------+
                    |  MySQL 8.4   |   | Razorpay    |
                    |  (Flyway)    |   | Gateways    |
                    +--------------+   +-------------+
```

---

## 2. Backend Container Deployment

### Environment Preparation
Configure environment variables using `.env`:
```bash
cp .env.example .env
# Edit DB credentials, JWT_SECRET, and RAZORPAY_KEY_* in .env
```

### Dockerized Build & Execution
```bash
# 1. Start MySQL 8.4 database
cd infrastructure/docker
docker compose up -d

# 2. Build backend Docker image
cd ../../backend
docker build -t southcolours/backend:latest .

# 3. Run container attached to host network or Docker network
docker run -d --name southcolours-api -p 8080:8080 --env-file ../.env southcolours/backend:latest
```

---

## 3. Database Migrations (Flyway)
The backend automatically checks and applies migrations on startup from:
`backend/src/main/resources/db/migration/V1__baseline_schema.sql`

To run migrations independently via Maven CLI:
```bash
mvn flyway:migrate -Dflyway.user=southcolours_user -Dflyway.password=southcolours_password
```

---

## 4. Android EAS Release Builds

### Prerequisites
- EAS CLI installed (`npm install -g eas-cli`)
- Expo account configured with access to project slugs

### Customer Android App Build
```bash
cd apps/customer-mobile
# For internal testing APK:
eas build --platform android --profile preview

# For Google Play Store AAB:
eas build --platform android --profile production
```

### Admin Android App Build
```bash
cd apps/admin-mobile
# For internal APK distribution:
eas build --platform android --profile preview

# For private distribution:
eas build --platform android --profile production
```

# TransferMe Deployment Guide

Complete guide for deploying TransferMe frontend and backend to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### Security & Configuration
- [ ] Update all sensitive credentials in environment variables
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up proper CORS configuration
- [ ] Enable rate limiting on API
- [ ] Configure API authentication properly
- [ ] Set up database backups
- [ ] Review and harden security policies
- [ ] Set up logging and monitoring
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Test all critical user flows

### Code Quality
- [ ] Run all tests locally
- [ ] Code review completed
- [ ] Dependencies updated and audited
- [ ] No hardcoded secrets or sensitive data
- [ ] Environment variables documented
- [ ] API versioning strategy in place

### Performance
- [ ] Backend load testing completed
- [ ] Frontend bundle size optimized
- [ ] Database queries optimized
- [ ] Caching strategy implemented
- [ ] CDN configured (if needed)

---

## Backend Deployment

### Option 1: Docker + Cloud Run (Recommended for Easy Setup)

#### 1. Create Dockerfile

```dockerfile
# Dockerfile in /Users/desireetorres/Desktop/backend/

FROM gradle:8.1-jdk21 AS builder
WORKDIR /build
COPY . .
RUN gradle bootJar -DskipTests

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=builder /build/build/libs/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 2. Create .dockerignore

```
.git
.gradle
build
.vscode
*.log
.env
.env.local
README.md
```

#### 3. Build Docker Image

```bash
cd /Users/desireetorres/Desktop/backend

# Build image
docker build -t transferme-backend:latest .

# Tag for registry (GCP example)
docker tag transferme-backend:latest gcr.io/YOUR_PROJECT_ID/transferme-backend:latest

# Push to registry
docker push gcr.io/YOUR_PROJECT_ID/transferme-backend:latest
```

### Option 2: Heroku Deployment

#### 1. Create Procfile

```
web: java -Dserver.port=$PORT $JAVA_OPTS -jar build/libs/*.jar
```

#### 2. Set Buildpacks

```bash
heroku buildpacks:clear
heroku buildpacks:add heroku/gradle
heroku buildpacks:add heroku/jvm
```

#### 3. Deploy

```bash
heroku login
heroku create transferme-backend
git push heroku main
```

### Option 3: AWS Elastic Beanstalk

#### 1. Create .ebextensions/java.config

```yaml
option_settings:
  aws:elasticbeanstalk:container:tomcat:jvm:
    JVM heap size: 512m
    JAVA_OPTS: "-Dserver.port=5000"
```

#### 2. Deploy

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p "Java 21 running on 64bit Amazon Linux 2" transferme-backend

# Create environment and deploy
eb create prod-env
eb deploy
```

### Option 4: Self-Hosted (VPS/Dedicated Server)

#### 1. Build Production JAR

```bash
cd /Users/desireetorres/Desktop/backend
./gradlew clean bootJar -DskipTests
```

#### 2. Create Systemd Service

Create `/etc/systemd/system/transferme-backend.service`:

```ini
[Unit]
Description=TransferMe Backend Service
After=network.target

[Service]
Type=simple
User=transferme
WorkingDirectory=/opt/transferme/backend
ExecStart=/usr/bin/java -jar app.jar
Restart=on-failure
RestartSec=10
Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="DATABASE_URL=postgresql://..."

[Install]
WantedBy=multi-user.target
```

#### 3. Deploy

```bash
# Copy JAR to server
scp /Users/desireetorres/Desktop/backend/build/libs/*.jar user@server:/opt/transferme/backend/app.jar

# SSH to server
ssh user@server

# Start service
sudo systemctl start transferme-backend
sudo systemctl enable transferme-backend

# Check status
sudo systemctl status transferme-backend
```

### Production Configuration

Update `src/main/resources/application-prod.properties`:

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database (PostgreSQL)
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.connection-timeout=30000

# Logging
logging.level.root=INFO
logging.level.com.transferhelper=DEBUG
logging.file.name=/var/log/transferme/backend.log
logging.file.max-size=10MB
logging.file.max-history=30

# Supabase OAuth
supabase.url=${SUPABASE_URL}
supabase.anon-key=${SUPABASE_ANON_KEY}

# Auth
app.auth.web-redirect-url=${AUTH_REDIRECT_URL}
app.auth.allowed-origins=${ALLOWED_ORIGINS}

# Performance
server.tomcat.max-threads=200
server.tomcat.min-spare-threads=10

# Security
server.http2.enabled=true
server.compression.enabled=true
```

---

## Frontend Deployment

### Option 1: Expo EAS Build (Recommended for React Native)

#### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

#### 2. Create eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "archive"
      }
    },
    "preview2": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "archive"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "buildType": "archive"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "./service-account.json",
        "track": "internal"
      },
      "ios": {
        "ascAppId": "YOUR_APP_ID"
      }
    }
  }
}
```

#### 3. Configure app.json

```json
{
  "expo": {
    "name": "TransferMe",
    "slug": "transferme",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0a0a0a"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.transferme.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0a0a0a"
      },
      "package": "com.transferme.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          },
          "ios": {
            "deploymentTarget": "13.4"
          }
        }
      ]
    ],
    "extra": {
      "apiUrl": {
        "dev": "http://localhost:8080/api",
        "staging": "https://staging-api.transferme.com/api",
        "prod": "https://api.transferme.com/api"
      }
    }
  }
}
```

#### 4. Build for Production

```bash
cd /Users/desireetorres/frontend/TransferMe

# Login to EAS
eas login

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Build for Web
npm run build

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

### Option 2: Google Play Store (Android)

#### 1. Create Signed APK/AAB

```bash
cd /Users/desireetorres/frontend/TransferMe

# Generate keystore
keytool -genkey -v -keystore ~/transferme-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias transferme-key

# Build AAB (recommended for Play Store)
eas build --platform android --profile production
```

#### 2. Submit to Play Store

- Go to [Google Play Console](https://play.google.com/console)
- Create new app
- Upload AAB file
- Fill in app details, screenshots, description
- Submit for review

### Option 3: Apple App Store (iOS)

#### 1. Prepare for iOS

```bash
# You'll need:
# - Apple Developer account ($99/year)
# - Certificate signing request
# - App ID
# - Provisioning profile

# Use EAS to handle most of this
eas build --platform ios --profile production
```

#### 2. Submit to App Store

- Use App Store Connect
- Create new app
- Upload build via Xcode or Transporter
- Fill in app details, screenshots, description
- Submit for review

### Option 4: Web Deployment (Vercel)

#### 1. Export Web Bundle

```bash
cd /Users/desireetorres/frontend/TransferMe
npx expo export --platform web
```

#### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or connect GitHub repository to Vercel for automatic deployments.

### Option 5: Web Deployment (Netlify)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## Database Setup

### PostgreSQL on Cloud (AWS RDS)

#### 1. Create RDS Instance

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier transferme-prod-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password "STRONG_PASSWORD" \
  --allocated-storage 20 \
  --storage-type gp2 \
  --publicly-accessible true
```

#### 2. Configure Security Group

- Allow port 5432 from application servers
- Restrict to specific IP addresses

#### 3. Run Database Migrations

```bash
# Using Flyway or Liquibase (if configured in backend)
./gradlew flywayMigrate \
  -Dflyway.url="jdbc:postgresql://HOST:5432/transferme" \
  -Dflyway.user=postgres \
  -Dflyway.password=PASSWORD
```

### PostgreSQL on DigitalOcean

```bash
# Create managed database
doctl databases create transferme \
  --engine pg \
  --region nyc3 \
  --num-nodes 1 \
  --size db-s-1vcpu-1gb
```

### PostgreSQL on Self-Hosted Server

```bash
# SSH to server
ssh user@server

# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE transferme;
CREATE USER transferme_user WITH PASSWORD 'strong_password';
ALTER ROLE transferme_user SET client_encoding TO 'utf8';
ALTER ROLE transferme_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE transferme_user SET default_transaction_deferrable TO on;
ALTER ROLE transferme_user SET default_transaction_read_committed TO on;
GRANT ALL PRIVILEGES ON DATABASE transferme TO transferme_user;
EOF
```

---

## Environment Configuration

### Backend Environment Variables

Create `.env.production`:

```bash
# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://DB_HOST:5432/transferme
SPRING_DATASOURCE_USERNAME=transferme_user
SPRING_DATASOURCE_PASSWORD=YOUR_SECURE_PASSWORD

# Supabase OAuth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Auth Configuration
APP_AUTH_WEB_REDIRECT_URL=https://transferme.com/auth/callback
APP_AUTH_ALLOWED_ORIGINS=https://transferme.com,https://www.transferme.com,https://app.transferme.com

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_TRANSFERHELPER=DEBUG

# Security
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRATION=86400

# Email (for notifications)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_sendgrid_api_key
```

### Frontend Environment Variables

Create `.env.production`:

```bash
EXPO_PUBLIC_API_URL=https://api.transferme.com/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_APP_ENV=production
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy TransferMe

on:
  push:
    branches: [main, production]
  pull_request:
    branches: [main]

env:
  REGISTRY: gcr.io
  IMAGE_NAME: transferme-backend

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Java
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Build Backend
        run: |
          cd /Users/desireetorres/Desktop/backend
          ./gradlew clean build -DskipTests
      
      - name: Run Tests
        run: |
          cd /Users/desireetorres/Desktop/backend
          ./gradlew test
      
      - name: Set up Docker
        uses: docker/setup-buildx-action@v2
      
      - name: Authenticate to GCP
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Build and Push Docker Image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ secrets.GCP_PROJECT_ID }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd /Users/desireetorres/frontend/TransferMe
          npm install
      
      - name: Run Linter
        run: |
          cd /Users/desireetorres/frontend/TransferMe
          npm run lint
      
      - name: Build Web
        run: |
          cd /Users/desireetorres/frontend/TransferMe
          npx expo export --platform web
      
      - name: Deploy to Vercel
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy:
    needs: [build-backend, build-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/production'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: transferme-backend
          image: ${{ env.REGISTRY }}/${{ secrets.GCP_PROJECT_ID }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          region: us-central1
          credentials_json: ${{ secrets.GCP_SA_KEY }}
```

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - test
  - deploy

variables:
  REGISTRY: registry.gitlab.com
  IMAGE_NAME: $CI_PROJECT_PATH

build-backend:
  stage: build
  image: gradle:8.1-jdk21
  script:
    - cd backend
    - gradle clean bootJar -DskipTests
  artifacts:
    paths:
      - backend/build/libs/*.jar

test-backend:
  stage: test
  image: gradle:8.1-jdk21
  script:
    - cd backend
    - gradle test

build-frontend:
  stage: build
  image: node:18
  script:
    - cd frontend/TransferMe
    - npm install
    - npm run lint
    - npx expo export --platform web

deploy-production:
  stage: deploy
  image: google/cloud-sdk:alpine
  script:
    - echo $GCP_SERVICE_ACCOUNT_KEY | base64 -d > ${HOME}/gcp-key.json
    - gcloud auth activate-service-account --key-file ${HOME}/gcp-key.json
    - gcloud config set project $GCP_PROJECT_ID
    - gcloud run deploy transferme-backend --source . --region us-central1
  only:
    - production
```

---

## Monitoring & Maintenance

### Error Tracking (Sentry)

```bash
# Install in backend
./gradlew dependencies add io.sentry:sentry-spring-boot-starter-jakarta

# Install in frontend
npm install @sentry/react-native
```

### Logging Stack (ELK)

```yaml
# docker-compose.yml for logging
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
```

### Monitoring & Alerting (Prometheus + Grafana)

```bash
# Add to Docker Compose
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

### Database Backups

```bash
# Automated daily backup script
#!/bin/bash
BACKUP_DIR="/var/backups/transferme"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -h $DB_HOST -U $DB_USER transferme | gzip > $BACKUP_DIR/transferme_$TIMESTAMP.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Health Checks

```bash
# Backend health endpoint
curl https://api.transferme.com/api/health

# Frontend uptime monitoring
# Use services like Uptime Robot, Pingdom, etc.
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security scan completed
- [ ] Performance testing done
- [ ] Database backups created
- [ ] Rollback plan prepared

### Deployment
- [ ] Backend deployed successfully
- [ ] Database migrations applied
- [ ] Frontend built and deployed
- [ ] SSL/HTTPS verified
- [ ] API endpoints responding
- [ ] User authentication working
- [ ] Error tracking configured
- [ ] Monitoring alerts active

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify user sessions
- [ ] Test critical user flows
- [ ] Check database connections
- [ ] Review logs for errors
- [ ] Update documentation
- [ ] Notify stakeholders

---

## Rollback Procedure

```bash
# Backend Rollback (Docker)
docker pull gcr.io/YOUR_PROJECT/transferme-backend:PREVIOUS_TAG
gcloud run deploy transferme-backend --image gcr.io/YOUR_PROJECT/transferme-backend:PREVIOUS_TAG

# Frontend Rollback (Vercel)
vercel rollback

# Database Rollback
# Restore from backup and re-run migrations
```

---

## Cost Estimation

### Recommended Setup (Monthly)
- Cloud Database (PostgreSQL): $15-50
- Application Server (Compute): $20-100
- Storage: $5-20
- CDN: $0-50 (pay per use)
- Monitoring: $0-50
- **Total**: ~$50-300/month

### Cost Optimization
- Use free tier for initial deployment (Google Cloud Free Tier, Heroku Free tier)
- Implement auto-scaling to handle traffic spikes
- Use CDN for static assets
- Enable database backups to cheaper storage (S3)

---

## Getting Help

- [Expo Documentation](https://docs.expo.dev/deployment/overview/)
- [Spring Boot Production Deployment](https://spring.io/guides/gs/securing-web/)
- [Docker Documentation](https://docs.docker.com/)
- [Cloud Platform Docs](https://cloud.google.com/docs, https://docs.aws.amazon.com/)

---

**Last Updated**: May 6, 2026

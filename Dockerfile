FROM node:24.11.0-alpine

# Asegurarnos de que Yarn está disponible (la imagen alpine de Node ya lo incluye)
WORKDIR /app

ENV  DB_PASSWORD="npg_YZap65ubJBzW" \
    DB_NAME="neondb" \
    DB_PORT="5432" \
    DB_HOST="ep-wispy-tooth-ahdjh5gr-pooler.c-3.us-east-1.aws.neon.tech" \
    DB_USERNAME="neondb_owner" \
    PORT=3300 \
    JWT_SECRET_KEY="inmob.api-DENNYS_REALTOR-1970-05-05" \
    AUTHORIZED_FRONTEND_DOMAIN="http://localhost:3000"  \
    FILE_SERVER_SERVICE_URL="http://localhost:8080" \
    GOOGLE_GEMINI_AI_API_KEY="AIzaSyBO_PkNoPsyCeg73IS7bJdZNXIXxWAd2e8" \
    DATABASE_URL="postgresql://neondb_owner:npg_YZap65ubJBzW@ep-wispy-tooth-ahdjh5gr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" \
    DB_ENDPOINT_ID="ep-wispy-tooth-ahdjh5gr-pooler" \
    CLOUDINARY_CLOUD_NAME="do974jtas" \
    CLOUDINARY_API_KEY="948158755154965"  \
    CLOUDINARY_API_SECRET="X_u3aUKQMwtBelQBNV8yh1UpO7o"  

# Copia los archivos de dependencias (incluyendo yarn.lock si existe)
COPY package*.json ./
COPY yarn.lock ./

# Instala las dependencias usando Yarn
RUN yarn install

# Copia el resto del código
COPY . .

# Construye la aplicación
RUN yarn build

EXPOSE 3300

CMD ["node", "dist/main"]
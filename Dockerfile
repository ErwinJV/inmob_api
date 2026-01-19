FROM node:24.11.0-alpine

# Asegurarnos de que Yarn está disponible (la imagen alpine de Node ya lo incluye)
WORKDIR /app

# Copia los archivos de dependencias (incluyendo yarn.lock si existe)
COPY package*.json ./
COPY yarn.lock ./
COPY .env . 
# Instala las dependencias usando Yarn
RUN yarn install --frozen-lockfile

# Copia el resto del código
COPY . .

# Construye la aplicación
RUN yarn build

EXPOSE 3300

CMD ["node", "dist/main"]
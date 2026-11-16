# Używamy oficjalnego obrazu Playwright - przeglądarki już zainstalowane
FROM mcr.microsoft.com/playwright:v1.61.0-jammy

WORKDIR /app

# Kopiujemy package.json osobno dla cache warstw
COPY package*.json ./

# playwright-core zamiast playwright - NIE pobiera przeglądarek ponownie (~300MB oszczędności)
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
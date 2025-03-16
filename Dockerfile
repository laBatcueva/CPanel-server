# Etapa base
FROM node:22-slim AS base

# Habilitar corepack para gestionar pnpm
RUN corepack enable

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias de producción
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación escucha
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["pnpm", "start"]

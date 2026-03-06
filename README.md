# 🛸 RickAPI — Character Explorer

> Buscador de personajes del universo Rick & Morty con filtros, vista de detalle y exportación a PDF.

🔗 **Demo en vivo:** [rickandmorty-frontend-omega.vercel.app](https://rickandmorty-frontend-omega.vercel.app)

---

## ✨ Features

- 🌌 Fondo animado de estrellas tipo hyperspace con canvas
- 🔍 Búsqueda de personajes por nombre en tiempo real
- 🏷️ Filtros por estado (Alive / Dead / Unknown) y especie
- 📊 Contador de resultados dinámico
- 📄 Paginación de personajes
- 👤 Vista de detalle por personaje con datos completos
- 🖨️ Exportación de ficha del personaje a PDF
- 📱 Diseño responsivo

---

## 🖼️ Preview

| Home | Detalle |
|------|---------|
| Grid de personajes con filtros sticky | Vista completa con stats y descarga PDF |

---

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 17 |
| Backend | Spring Boot (Java) |
| API externa | [Rick and Morty API](https://rickandmortyapi.com) |
| PDF | PdfMake |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |

---

## 🚀 Correr en local

### Backend

```bash
# Clonar el repo
git clone https://github.com/cristell-0821/rickandmorty-backend.git
cd rickandmorty-backend

# Levantar con Maven
./mvnw spring-boot:run
```

El backend corre en `http://localhost:8080`

### Frontend

```bash
# Clonar el repo
git clone https://github.com/cristell-0821/rickandmorty-frontend.git
cd rickandmorty-frontend

# Instalar dependencias
npm install

# Levantar
ng serve
```

El frontend corre en `http://localhost:4200`

> ⚠️ Asegúrate de que el backend esté corriendo antes de levantar el frontend.

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── home/                  # Lista de personajes + filtros
│   ├── character-detail/      # Vista de detalle + PDF
│   ├── services/              # CharacterService (HTTP)
│   ├── character.model.ts     # Interface Character
│   └── app.component.*        # Starfield canvas + router
└── assets/
    └── img/
        └── titulo.webp
```

---

## 🌐 Deploy

| Servicio | URL |
|---------|-----|
| Frontend (Vercel) | [rickandmorty-frontend-omega.vercel.app](https://rickandmorty-frontend-omega.vercel.app) |
| Backend (Railway) | [rickandmorty-backend-production-7746.up.railway.app](https://rickandmorty-backend-production-7746.up.railway.app) |

---

## 👩‍💻 Autora

**Cristell** — [github.com/cristell-0821](https://github.com/cristell-0821)

# 🛸 RickAndMorty — Character Explorer & Memory Game

> App interactiva del universo Rick & Morty con buscador de personajes y juego de memoria.

🔗 **Demo en vivo:** [rickandmorty-frontend-omega.vercel.app](https://rickandmorty-frontend-omega.vercel.app)

---

## ✨ Features

### 🔍 Buscador de Personajes
- 🌌 Fondo animado de estrellas tipo hyperspace con canvas
- 🔍 Búsqueda por nombre en tiempo real
- 🏷️ Filtros por estado (Alive / Dead / Unknown) y especie
- 📊 Contador de resultados dinámico
- 📄 Paginación de personajes
- 👤 Vista de detalle por personaje con stats completos
- 🖨️ Exportación de ficha del personaje a PDF

### 🎮 Juego de Memoria
- 3 niveles de dificultad: Fácil (4×3), Normal (4×4), Difícil (6×4)
- Cronómetro y contador de intentos en tiempo real
- Barra de progreso de pares encontrados
- Pantalla de victoria con puntaje calculado
- Cards con flip animation y personajes reales de la API

### General
- 📱 Diseño responsivo
- 🎨 UI oscura estilo galaxia coherente en toda la app

---

## 🖼️ Preview

| Landing | Buscador | Detalle | Memoria |
|---------|----------|---------|---------|
| Selección de modo | Grid con filtros sticky | Stats + descarga PDF | Tablero con flip cards |

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
│   ├── landing/               # Pantalla principal con selección de modo
│   ├── home/                  # Buscador de personajes + filtros
│   ├── character-detail/      # Vista de detalle + exportación PDF
│   ├── memory/                # Juego de memoria
│   ├── services/              # CharacterService (HTTP)
│   ├── character.model.ts     # Interface Character
│   └── app.component.*        # Starfield canvas + router
└── assets/
    └── img/
        ├── titulo.webp
        ├── portal.png
        ├── buscador.jpg
        └── memoria.jpg
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

# Sistema de Gestión de Inventarios y Trazabilidad (Infraestructura)

Monorepo enterprise para la gestión de almacenes, catálogo de activos, órdenes de compra, recepciones, solicitudes de despacho y auditoría/trazabilidad en tiempo real para el Departamento de Infraestructura.

## Stack Tecnológico

- **Backend:** FastAPI (Python 3.11+), SQLAlchemy 2.0 (ORM moderno con `Mapped`), Pydantic v2, Alembic, PyJWT/python-jose, Passlib (Bcrypt), Psycopg2.
- **Frontend:** React 18+, Vite, TypeScript, TailwindCSS, TanStack Query v5, React Router v6, Zustand, Axios.
- **Base de Datos:** PostgreSQL 15+ con soporte JSONB para auditoría de cambios.
- **Orquestación:** Docker & Docker Compose con healthchecks y hot-reloading.

---

## Estructura del Proyecto

```text
system_inventory/
├── docker-compose.yml          # Orquestación de contenedores (PostgreSQL, Backend, Frontend)
├── .env.example                # Variables de entorno de referencia
├── README.md                   # Documentación del sistema
├── backend/                    # Capa de API y Servicios (Clean Architecture)
│   ├── alembic/                # Migraciones de base de datos
│   ├── alembic.ini             # Configuración de Alembic
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # Entrypoint FastAPI con CORS y Exception Handlers
│       ├── core/               # Configuración (Pydantic Settings), DB y Seguridad JWT
│       ├── models/             # Modelos ORM SQLAlchemy 2.0
│       ├── schemas/            # Esquemas Pydantic v2 (DTOs)
│       ├── services/           # Lógica de negocio transaccional y auditoría
│       └── api/v1/             # Endpoints versionados
└── frontend/                   # Single Page Application (Feature-Driven Architecture)
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── api/                # Cliente Axios con interceptores JWT Bearer y 401/403
        ├── store/              # Zustand Auth Store con persistencia
        ├── routes/             # Enrutamiento protegido por autenticación y roles
        ├── components/layout/  # MainLayout, Sidebar y Navbar
        ├── pages/              # Vistas principales (Dashboard, Inventario, Recepciones, etc.)
        └── features/           # Módulos desacoplados (api, components, hooks, types)
```

---

## Despliegue Rápido con Docker Compose

1. **Clonar y configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

2. **Levantar los servicios:**
   ```bash
   docker compose up --build
   ```

3. **Acceso a los servicios:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **OpenAPI Redoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **PostgreSQL:** `localhost:5432` (db: `inventory_db`, user: `postgres`)

---

## Ejecución Local sin Docker (Entorno de Desarrollo)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```


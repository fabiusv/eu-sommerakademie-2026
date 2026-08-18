# CivilEU

CivilEU combines a Next.js frontend with a host-agnostic, containerized Django
backend for aggregating European civic and youth opportunities.

## Repository structure

- `src/` and `public/` contain the product frontend.
- `backend/` contains the complete CivilEU backend package, including its
  Docker/Compose topology, migrations, tests, architecture, roadmap, and
  deployment runbook.
- `backend/frontend.html` is a standalone backend testing interface. It is not
  part of the deployable frontend or backend image.

## Frontend development

Install the JavaScript dependencies and start the development server:

```shell
npm install
npm run dev
```

The frontend is then available at <http://localhost:3000>.

## Backend development and deployment

Run backend commands from the `backend/` directory:

```shell
cd backend
cp .env.example .env
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

The backend API is then available at <http://localhost:8000>. See the
[backend README](backend/README.md) for development and API details and the
[deployment runbook](backend/deployment/README.md) for the provider-neutral
production container contract.

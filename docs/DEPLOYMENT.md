# Deployment

The API runs on Render and the frontend on Vercel. Neither needs a secret: the only settings are two web addresses.

| Part | Host | Config |
|---|---|---|
| API (FastAPI) | Render, free web service | [render.yaml](../render.yaml) |
| Frontend (React, Vite) | Vercel, free hobby plan | [frontend/vercel.json](../frontend/vercel.json) |

## Settings

| Where | Name | Value |
|---|---|---|
| Render (API) | `ALLOWED_ORIGINS` | The Vercel site address, such as `https://arthayukti.vercel.app`. No trailing slash. Several addresses can be separated by commas. |
| Render (API) | `PYTHON_VERSION` | `3.12.10` (already in `render.yaml`) |
| Vercel (frontend) | `VITE_API_BASE_URL` | The Render API address, such as `https://arthayukti-api.onrender.com`. No trailing slash. It is read when the site is built, so change it and redeploy. |

## Order of steps

1. Push the code to GitHub.
2. Render: create the API and note its address.
3. Vercel: create the site with `VITE_API_BASE_URL` set to the API address, and note its address.
4. Render: set `ALLOWED_ORIGINS` to the Vercel address and let it restart.
5. Check it: open `<api address>/api/v1/health`, then open the site and run the whole demo.

## Before a demo

Render's free web services stop after about 15 minutes with no visits, and the first request afterwards can take up to a minute. Open the site and the health address a few minutes before anyone uses it.

## If something is wrong

| What you see | Likely cause |
|---|---|
| "We could not reach the calculator" | `VITE_API_BASE_URL` is wrong or empty, or the API is still waking up. Fix it and redeploy the frontend. |
| Browser console shows a CORS error | `ALLOWED_ORIGINS` does not exactly match the site address (check `http` against `https`, and any trailing slash). |
| `/api/v1/samples` fails on the API | The API was installed without `pip install -e backend`, so it cannot find `contracts/samples`. |
| Blank page on Vercel | The Vercel project's Root Directory is not `frontend`. |

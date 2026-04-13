from fastapi import FastAPI

app = FastAPI(
    title='Backend Declic FastAPI',
    description='API FastAPI pour consultation rapide des endpoints et tests',
    version='1.0.0',
)


@app.get('/health', tags=['system'])
def healthcheck() -> dict[str, str]:
    return {'status': 'ok'}


@app.get('/api-info', tags=['system'])
def api_info() -> dict[str, str]:
    return {
        'service': 'backend-declic-fastapi',
        'docs': '/docs',
        'redoc': '/redoc',
    }

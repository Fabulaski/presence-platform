import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes.js';
import fs from 'fs';
import path from 'path';

const openapiPath = fs.existsSync(path.resolve(__dirname, '../openapi.json'))
  ? path.resolve(__dirname, '../openapi.json')
  : path.resolve(process.cwd(), 'openapi.json');
const openapiSpec = JSON.parse(fs.readFileSync(openapiPath, 'utf-8'));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/v1', apiRouter);

app.get('/openapi.json', (req, res) => {
  res.json(openapiSpec);
});

app.get('/docs', (req, res) => {
  res.send(`
    <!doctype html>
    <html>
      <head>
        <title>Presence Platform API Reference</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <script id="api-reference" data-url="/openapi.json"></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Presence API] Server running on http://localhost:${PORT}`);
  console.log(`[Presence API] OpenAPI 3.1 Spec available at http://localhost:${PORT}/openapi.json`);
});

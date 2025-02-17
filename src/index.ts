import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

import 'dotenv/config';

const nominatimURL = process.env.instanceURL;
const app = new Hono();

app.use('/*', cors());

app.get('/', (c) => {
    return c.text('IzNominatim v1.0.0 - https://github.com/IzMichael/IzNominatim');
});

app.post('/latlng', async (c) => {
    const body = (await c.req.json()) as {
        addresses: string[];
    };

    const requests = [];

    for (let i = 0; i < body.addresses.length; i++) {
        const addr = body.addresses[i];

        requests.push({
            query: addr,
            result: (
                await fetch(nominatimURL + '/search?q=' + encodeURIComponent(addr)).then((res) => {
                    return res.json();
                })
            )[0],
        });
    }

    const data = requests.flat();

    return c.json({ status: 'success', items: data }, 200);
});

const port = parseInt(process.env.port ?? '2048');
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});

// Helpers

function chunk<T>(arr: T[], chunkSize: number): T[][] {
    if (chunkSize <= 0) throw 'Invalid chunk size';
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize) R.push(arr.slice(i, i + chunkSize));
    return R;
}


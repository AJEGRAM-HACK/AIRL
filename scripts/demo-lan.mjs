import { createServer } from 'node:https';
import { readFileSync, existsSync, mkdirSync, chmodSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import next from 'next';

// TLS termination stays in this process so request URLs and Secure cookies use HTTPS.
const host = process.env.AIRL_DEMO_HOST;
const addresses = Object.values(networkInterfaces()).flat().filter(Boolean);
const privateIPv4 = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
if (!host || !privateIPv4.test(host) || !addresses.some(address => address.address === host && address.family === 'IPv4')) {
  console.error('Set AIRL_DEMO_HOST to a private IPv4 address assigned to this Mac, for example the output of ipconfig getifaddr en0.');
  process.exit(1);
}
const port = Number(process.env.AIRL_DEMO_PORT || 3443);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('AIRL_DEMO_PORT must be between 1024 and 65535.');
const directory = resolve('.data/demo-tls');
const caKey = join(directory, 'root.key');
const caCert = join(directory, 'root.crt');
const key = join(directory, `${host}.key`);
const cert = join(directory, `${host}.crt`);
const origin = `https://${host}:${port}`;

if (process.argv.includes('--setup')) {
  process.umask(0o077);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  chmodSync(directory, 0o700);
  if (!existsSync(caKey) && !existsSync(caCert)) {
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:3072', '-nodes', '-keyout', caKey, '-out', caCert, '-days', '365', '-subj', '/CN=AIRL Local Demo CA', '-addext', 'basicConstraints=critical,CA:TRUE', '-addext', 'keyUsage=critical,keyCertSign,cRLSign'], { stdio: 'ignore' });
  }
  if (!existsSync(caKey) || !existsSync(caCert)) throw new Error('Incomplete local CA. Restore its matching key and certificate before setup.');
  const csr = join(directory, `${host}.csr`);
  const { writeFileSync, unlinkSync } = await import('node:fs');
  const extensions = join(directory, `${host}.ext`);
  writeFileSync(extensions, `basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=IP:${host}\n`);
  execFileSync('openssl', ['req', '-new', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', csr, '-subj', '/CN=AIRL Local Demo'], { stdio: 'ignore' });
  execFileSync('openssl', ['x509', '-req', '-in', csr, '-CA', caCert, '-CAkey', caKey, '-CAcreateserial', '-out', cert, '-days', '30', '-extfile', extensions], { stdio: 'ignore' });
  unlinkSync(csr);
  unlinkSync(extensions);
  console.log(`Install and trust this public CA certificate on demo phones using AirDrop, USB or another trusted transfer: ${caCert}`);
  console.log(execFileSync('openssl', ['x509', '-in', caCert, '-noout', '-fingerprint', '-sha256'], { encoding: 'utf8' }).trim());
  console.log(`Audience ${origin}/live/barangay-2099\nStudio ${origin}/studio/barangay-2099`);
  process.exit(0);
}
if (!existsSync(key) || !existsSync(cert)) throw new Error('Run npm run demo:setup with this AIRL_DEMO_HOST first.');
const server = createServer({ key: readFileSync(key), cert: readFileSync(cert), minVersion: 'TLSv1.2' });
const app = next({ dev: false, hostname: host, port, httpServer: server });
await app.prepare();
const handle = app.getRequestHandler();
server.on('request', (request, response) => {
  if (request.headers.host !== `${host}:${port}`) {
    response.writeHead(421).end('Use the configured demo address.');
    return;
  }
  // Replace proxy headers supplied by LAN clients before Next.js constructs URLs.
  delete request.headers.forwarded;
  request.headers['x-forwarded-proto'] = 'https';
  request.headers['x-forwarded-host'] = `${host}:${port}`;
  request.headers['x-forwarded-port'] = String(port);
  request.headers['x-forwarded-for'] = request.socket.remoteAddress;
  response.setHeader('X-Content-Type-Options', 'nosniff');
  void handle(request, response);
});
server.listen(port, host, () => console.log(`AIRL HTTPS audience ${origin}/live/barangay-2099\nStudio and room QR ${origin}/studio/barangay-2099\nOllama stays on server loopback. Press Ctrl+C to stop.`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close();
  server.closeAllConnections();
  void app.close().then(() => process.exit(0));
});

// One persistent connection to the Paper MCP relay.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
export const FILE = '01M7M1ADYHCM6H8MZ1ZRBSTH3D';
export async function connect() {
  const p = spawn(process.env.HOME + '/.paper/bin/paper', ['mcp'], { stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '', id = 0; const wait = new Map();
  p.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) continue; try { const m = JSON.parse(line); if (m.id != null && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } } catch (e) {} } });
  const rpc = (method, params) => new Promise((res, rej) => { const n = ++id; wait.set(n, res); p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: n, method, params }) + '\n'); setTimeout(() => rej(new Error('timeout ' + method)), 180000); });
  await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'cli-relay', version: '0.1' } });
  p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  async function call(name, args, shot) {
    const r = await rpc('tools/call', { name, arguments: Object.assign({ fileId: FILE }, args) });
    if (r.error) throw new Error(name + ': ' + JSON.stringify(r.error));
    let text = '';
    for (const c of r.result.content || []) { if (c.type === 'text') text += c.text; else if (c.type === 'image' && shot) { fs.writeFileSync(shot, Buffer.from(c.data, 'base64')); text += '[image ' + shot + ']'; } }
    if (r.result.isError) throw new Error(name + ' isError: ' + text.slice(0, 600));
    // responses are a file header object followed by the payload object
    const cut = text.indexOf('}{'); const body = cut >= 0 && text.trimStart().startsWith('{') ? text.slice(cut + 1) : text;
    try { return JSON.parse(body); } catch (e) { return body; }
  }
  return { call, close() { p.kill(); } };
}

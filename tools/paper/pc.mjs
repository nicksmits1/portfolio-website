// Minimal MCP stdio client for the Paper relay.
// Usage: node pc.mjs list | node pc.mjs call <tool> '<json args>' | node pc.mjs callf <tool> <args.json>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const [mode, tool, arg] = process.argv.slice(2);
const p = spawn(process.env.HOME + '/.paper/bin/paper', ['mcp'], { stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '', id = 0; const wait = new Map();
p.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) continue; try { const m = JSON.parse(line); if (m.id != null && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } } catch (e) {} } });
p.stderr.on('data', d => process.env.PC_DEBUG && process.stderr.write(d));
const rpc = (method, params) => new Promise((res, rej) => { const n = ++id; wait.set(n, res); p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: n, method, params }) + '\n'); setTimeout(() => rej(new Error('timeout ' + method)), 120000); });
const out = (r, dir) => { if (r.error) { console.log('ERROR', JSON.stringify(r.error)); return; } for (const c of r.result.content || []) { if (c.type === 'text') console.log(c.text); else if (c.type === 'image') { const f = (dir || '.') + '/shot-' + Date.now() + '.' + (c.mimeType || 'image/png').split('/')[1]; fs.writeFileSync(f, Buffer.from(c.data, 'base64')); console.log('[image saved] ' + f); } else console.log(JSON.stringify(c).slice(0, 400)); } if (r.result.isError) console.log('[isError]'); };
try {
  const init = await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'cli-relay', version: '0.1' } });
  p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  if (mode === 'list') { console.log('SERVER', JSON.stringify(init.result.serverInfo)); console.log('INSTRUCTIONS\n' + (init.result.instructions || '(none)')); const t = await rpc('tools/list', {}); for (const x of t.result.tools) console.log('\n## ' + x.name + '\n' + x.description + '\nSCHEMA ' + JSON.stringify(x.inputSchema)); }
  else { const args = mode === 'callf' ? JSON.parse(fs.readFileSync(arg, 'utf8')) : JSON.parse(arg || '{}'); out(await rpc('tools/call', { name: tool, arguments: args }), process.env.PC_OUT); }
} catch (e) { console.log('FAIL', e.message); }
p.kill(); process.exit(0);

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.js';

test('แก้หัวข้อได้และคง body เดิมเมื่อไม่ส่งมา', async () => {
  const srv = await startTestServer();
  try {
    const before = await srv.request('GET', '/api/announcements/1');
    const res = await srv.request('PATCH', '/api/announcements/1', { title: 'หัวข้อใหม่' });

    assert.equal(res.status, 200);
    assert.equal(res.data.title, 'หัวข้อใหม่');
    assert.equal(res.data.body, before.data.body);
  } finally {
    await srv.close();
  }
});

test('แก้เฉพาะ title และไม่บันทึกฟิลด์อื่นที่ส่งมา', async () => {
  const srv = await startTestServer();
  try {
    const res = await srv.request('PATCH', '/api/announcements/1', {
      title: 'หัวข้ออีกครั้ง',
      pinned: true,
    });
    const got = await srv.request('GET', '/api/announcements/1');

    assert.equal(res.status, 200);
    assert.equal(got.data.title, 'หัวข้ออีกครั้ง');
    assert.equal('pinned' in got.data, false);
  } finally {
    await srv.close();
  }
});

test('หัวข้อว่าง → 400', async () => {
  const srv = await startTestServer();
  try {
    const res = await srv.request('PATCH', '/api/announcements/1', { title: '   ' });

    assert.equal(res.status, 400);
    assert.ok(res.data.error);
  } finally {
    await srv.close();
  }
});

test('แก้ประกาศที่ไม่มีอยู่ → 404', async () => {
  const srv = await startTestServer();
  try {
    const res = await srv.request('PATCH', '/api/announcements/9999', { title: 'x' });

    assert.equal(res.status, 404);
    assert.deepEqual(res.data, { error: 'ไม่พบประกาศ' });
  } finally {
    await srv.close();
  }
});
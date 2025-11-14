// script.js
// ปรับค่า API_BASE เป็นโดเมนของโปรเจกต์ Vercel ของคุณ
const API_BASE = "https://test-flask-4alua7u46-gitgitomes-projects.vercel.app/api/users";

// พื้นที่แสดง API base
document.getElementById('api-base').textContent = API_BASE.replace('/api/users','/api');

// helper: แสดงข้อความสถานะ
function setStatus(elId, msg, isError=false) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.style.color = isError ? 'crimson' : '';
  if (msg) setTimeout(()=>{ if(el.textContent===msg) el.textContent=''; }, 4000);
}

// --- Create ---
document.getElementById('btn-create').addEventListener('click', async () => {
  const id = document.getElementById('create-id').value.trim();
  const name = document.getElementById('create-name').value.trim();
  const email = document.getElementById('create-email').value.trim();
  const role = document.getElementById('create-role').value.trim();

  if (!name || !email) { setStatus('create-status','กรุณากรอก name และ email', true); return; }

  const payload = { name, email, role };
  if (id) payload.id = id; // ใส่ id ถ้ามี

  document.getElementById('btn-create').disabled = true;
  setStatus('create-status','กำลังสร้าง...');

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || JSON.stringify(data));
    setStatus('create-status','สร้างสำเร็จ');
    // ล้างฟอร์ม
    document.getElementById('create-id').value='';
    document.getElementById('create-name').value='';
    document.getElementById('create-email').value='';
    document.getElementById('create-role').value='';
    // refresh list
    loadUsers();
  } catch (err) {
    setStatus('create-status','Error: '+err.message, true);
  } finally {
    document.getElementById('btn-create').disabled = false;
  }
});

// --- Read / List ---
async function loadUsers() {
  setStatus('list-status','โหลดข้อมูล...');
  const tbody = document.querySelector('#users-table tbody');
  tbody.innerHTML = '';
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || JSON.stringify(data));
    if (Array.isArray(data) && data.length) {
      for (const u of data) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="id-cell">${u.id}</td>
          <td><input data-field="name" value="${escapeHtml(u.name||'')}" /></td>
          <td><input data-field="email" value="${escapeHtml(u.email||'')}" /></td>
          <td><input data-field="role" value="${escapeHtml(u.role||'')}" /></td>
          <td>
            <button class="action-btn save">Save</button>
            <button class="action-btn danger delete">Delete</button>
          </td>
        `;
        // attach event listeners for save and delete
        tr.querySelector('.save').addEventListener('click', ()=> onSaveRow(tr));
        tr.querySelector('.delete').addEventListener('click', ()=> onDeleteRow(tr));
        tbody.appendChild(tr);
      }
    } else {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="5" style="color:gray">ไม่มีข้อมูล</td>`;
      tbody.appendChild(tr);
    }
    setStatus('list-status','โหลดเสร็จ');
  } catch (err) {
    setStatus('list-status','Error: '+err.message, true);
  }
}

// button refresh
document.getElementById('btn-refresh').addEventListener('click', loadUsers);

// helper escape
function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

// --- Save (update) จาก row ---
async function onSaveRow(tr){
  const id = tr.querySelector('.id-cell').textContent.trim();
  const name = tr.querySelector('input[data-field="name"]').value.trim();
  const email = tr.querySelector('input[data-field="email"]').value.trim();
  const role = tr.querySelector('input[data-field="role"]').value.trim();

  const payload = {};
  if (name) payload.name = name;
  if (email) payload.email = email;
  payload.role = role;

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || JSON.stringify(data));
    setStatus('list-status','อัปเดตสำเร็จ');
    loadUsers();
  } catch (err) {
    setStatus('list-status','Update error: '+err.message, true);
  }
}

// --- Delete จาก row ---
async function onDeleteRow(tr){
  const id = tr.querySelector('.id-cell').textContent.trim();
  if (!confirm(`ลบ ${id} จริงหรือไม่?`)) return;
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || JSON.stringify(data));
    setStatus('list-status','ลบสำเร็จ');
    loadUsers();
  } catch (err) {
    setStatus('list-status','Delete error: '+err.message, true);
  }
}

// --- Update section (manual) ---
document.getElementById('btn-update').addEventListener('click', async () => {
  const id = document.getElementById('update-id').value.trim();
  if (!id) { setStatus('update-status','กรุณาใส่ ID', true); return; }
  const name = document.getElementById('update-name').value.trim();
  const email = document.getElementById('update-email').value.trim();
  const role = document.getElementById('update-role').value.trim();

  const payload = {};
  if (name) payload.name = name;
  if (email) payload.email = email;
  if (role) payload.role = role;

  if (Object.keys(payload).length === 0) { setStatus('update-status','ไม่มีฟิลด์ให้แก้ไข', true); return; }

  document.getElementById('btn-update').disabled = true;
  setStatus('update-status','กำลังอัปเดต...');
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || JSON.stringify(data));
    setStatus('update-status','อัปเดตสำเร็จ');
    document.getElementById('update-id').value='';
    document.getElementById('update-name').value='';
    document.getElementById('update-email').value='';
    document.getElementById('update-role').value='';
    loadUsers();
  } catch (err) {
    setStatus('update-status','Error: '+err.message, true);
  } finally {
    document.getElementById('btn-update').disabled = false;
  }
});

// --- Delete section (manual) ---
document.getElementById('btn-delete').addEventListener('click', async () => {
  const id = document.getElementById('delete-id').value.trim();
  if (!id) { setStatus('delete-status','กรุณาใส่ ID', true); return; }
  if (!confirm(`ลบ ${id} จริงหรือไม่?`)) return;
  document.getElementById('btn-delete').disabled = true;
  setStatus('delete-status','กำลังลบ...');
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || JSON.stringify(data));
    setStatus('delete-status','ลบสำเร็จ');
    document.getElementById('delete-id').value='';
    loadUsers();
  } catch (err) {
    setStatus('delete-status','Error: '+err.message, true);
  } finally {
    document.getElementById('btn-delete').disabled = false;
  }
});

// initial load
loadUsers();

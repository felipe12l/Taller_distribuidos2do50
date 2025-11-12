import './style.css';

const apiBase = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '/api';
const studentsBase = import.meta.env.VITE_STUDENTS_BASE?.replace(/\/$/, '') || `${apiBase}/students`;
const classroomsBase = import.meta.env.VITE_CLASSROOMS_BASE?.replace(/\/$/, '') || `${apiBase}/classrooms`;
const loansBase = import.meta.env.VITE_LOANS_BASE?.replace(/\/$/, '') || `${apiBase}/loans`;
const metricsBase = import.meta.env.VITE_METRICS_BASE?.replace(/\/$/, '') || `${apiBase}/metrics`;

const API = {
  classrooms: classroomsBase,
  loans: loansBase,
  students: studentsBase,
  metrics: metricsBase
};

const state = {
  editing: {
    classroom: null,
    loan: null,
    student: null
  },
  charts: {
    classroomFrequency: null
  }
};

const app = document.querySelector('#app');

function renderLayout() {
  app.innerHTML = `
    <main class="layout">
      <header class="main-header">
        <div>
          <h1>Campus Manager</h1>
          <p class="subtitle">Administra aulas, estudiantes y préstamos en un solo lugar.</p>
        </div>
        <div class="header-actions">
          <button id="refreshAll" class="secondary">Actualizar todo</button>
        </div>
      </header>

      <section class="card" id="classroomSection">
        <div class="card-header">
          <div>
            <h2>Aulas</h2>
            <p>Gestiona el inventario de aulas disponibles.</p>
          </div>
          <div class="card-actions">
            <button id="classroomRefresh" class="secondary">Actualizar</button>
          </div>
        </div>
        <div class="message" id="classroomMessage"></div>
        <form id="classroomForm" class="form">
          <input type="hidden" name="id" />
          <div class="form-grid">
            <label>
              Descripción
              <input name="description" placeholder="Ej. Aula 101" required />
            </label>
            <label>
              Capacidad
              <input name="capacity" type="number" min="0" step="1" required />
            </label>
            <label>
              Disponible
              <select name="available" required>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </label>
          </div>
          <div class="form-actions">
            <button type="submit" id="classroomSubmit">Guardar aula</button>
            <button type="button" id="classroomCancel" class="secondary">Cancelar edición</button>
          </div>
        </form>
        <div class="table-wrapper">
          <table id="classroomTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Capacidad</th>
                <th>Disponible</th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <section class="card" id="studentSection">
        <div class="card-header">
          <div>
            <h2>Estudiantes</h2>
            <p>Administra el directorio de estudiantes.</p>
          </div>
          <div class="card-actions">
            <button id="studentRefresh" class="secondary">Actualizar</button>
          </div>
        </div>
        <div class="message" id="studentMessage"></div>
        <form id="studentForm" class="form">
          <input type="hidden" name="id" />
          <div class="form-grid">
            <label>
              Nombre completo
              <input name="name" placeholder="Ej. María Gómez" required />
            </label>
            <label>
              Correo
              <input name="email" type="email" placeholder="maria@ejemplo.com" required />
            </label>
          </div>
          <div class="form-actions">
            <button type="submit" id="studentSubmit">Guardar estudiante</button>
            <button type="button" id="studentCancel" class="secondary">Cancelar edición</button>
          </div>
        </form>
        <div class="table-wrapper">
          <table id="studentTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <section class="card" id="loanSection">
        <div class="card-header">
          <div>
            <h2>Préstamos</h2>
            <p>Controla los préstamos de aulas por fecha y horario.</p>
          </div>
          <div class="card-actions">
            <button id="loanRefresh" class="secondary">Actualizar</button>
          </div>
        </div>
        <div class="message" id="loanMessage"></div>
        <form id="loanForm" class="form">
          <input type="hidden" name="id" />
          <div class="form-grid loan-grid">
            <label>
              ID estudiante
              <input name="borrowerId" placeholder="ID del estudiante" required />
            </label>
            <label>
              ID aula
              <input name="classroomId" placeholder="ID del aula" required />
            </label>
            <label>
              Estado
              <select name="status" required>
                <option value="REQUESTED">REQUESTED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="FINISHED">FINISHED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </label>
            <label>
              Fecha (YYYY-MM-DD)
              <input name="loanDate" type="date" required />
            </label>
            <label>
              Hora inicio
              <input name="startHour" type="number" min="0" max="23" required />
            </label>
            <label>
              Hora fin
              <input name="endHour" type="number" min="0" max="23" required />
            </label>
          </div>
          <div class="form-actions">
            <button type="submit" id="loanSubmit">Guardar préstamo</button>
            <button type="button" id="loanCancel" class="secondary">Cancelar edición</button>
          </div>
        </form>
        <div class="table-wrapper">
          <table id="loanTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Aula</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Hora inicio</th>
                <th>Hora fin</th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <section class="card" id="metricsSection">
        <div class="card-header">
          <div>
            <h2>Métricas</h2>
            <p>Observa tendencias de uso en los préstamos.</p>
          </div>
          <div class="card-actions">
            <button id="metricsRefresh" class="secondary">Actualizar</button>
          </div>
        </div>
        <div class="metrics-grid">
          <div class="metric-block">
            <h3>Hora con más reservas</h3>
            <p id="topHourText" class="metric-text">Cargando...</p>
          </div>
          <div class="metric-block">
            <h3>Préstamos por aula</h3>
            <div class="table-wrapper">
              <table id="metricsClassroomTable">
                <thead>
                  <tr><th>Aula</th><th>Préstamos</th></tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
          <div class="metric-block">
            <h3>Visualización</h3>
            <canvas id="classroomFrequencyChart" height="160"></canvas>
          </div>
        </div>
      </section>
    </main>
  `;
}

async function http(url, { method = 'GET', body, headers } = {}) {
  const init = { method, headers: { ...(headers || {}) } };
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

function showMessage(sectionId, message, type = 'info') {
  const el = document.getElementById(sectionId);
  if (!el) return;
  if (!message) {
    el.textContent = '';
    delete el.dataset.type;
    return;
  }
  el.textContent = message;
  el.dataset.type = type;
}

function resetClassroomForm() {
  const form = document.getElementById('classroomForm');
  form.reset();
  const hidden = form.querySelector('input[name="id"]');
  if (hidden) hidden.value = '';
  state.editing.classroom = null;
  document.getElementById('classroomSubmit').textContent = 'Guardar aula';
  showMessage('classroomMessage', '', 'info');
}

async function loadClassrooms() {
  try {
    const data = await http(API.classrooms);
    const tbody = document.querySelector('#classroomTable tbody');
    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.id ?? ''}</td>
        <td>${item.description ?? ''}</td>
        <td>${item.capacity ?? ''}</td>
        <td>${item.available ? 'Sí' : 'No'}</td>
        <td class="table-actions">
          <button class="secondary" data-action="edit" data-id="${item.id}">Editar</button>
          <button class="danger" data-action="delete" data-id="${item.id}">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showMessage('classroomMessage', err.message, 'error');
  }
}

async function handleClassroomSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const fd = new FormData(form);
  const payload = {
    description: fd.get('description')?.trim(),
    capacity: Number(fd.get('capacity')),
    available: fd.get('available') === 'true'
  };
  const id = state.editing.classroom;
  try {
    if (id) {
      await http(`${API.classrooms}/${id}`, { method: 'PUT', body: payload });
      showMessage('classroomMessage', 'Aula actualizada correctamente.', 'success');
    } else {
      await http(API.classrooms, { method: 'POST', body: payload });
      showMessage('classroomMessage', 'Aula creada correctamente.', 'success');
    }
    resetClassroomForm();
    await loadClassrooms();
  } catch (err) {
    showMessage('classroomMessage', err.message, 'error');
  }
}

async function handleClassroomAction(event) {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'edit') {
    try {
      const data = await http(`${API.classrooms}/${id}`);
      const form = document.getElementById('classroomForm');
      form.description.value = data.description ?? '';
      form.capacity.value = data.capacity ?? 0;
      form.available.value = data.available ? 'true' : 'false';
      const hidden = form.querySelector('input[name="id"]');
      if (hidden) hidden.value = data.id ?? '';
      state.editing.classroom = id;
      document.getElementById('classroomSubmit').textContent = 'Actualizar aula';
      showMessage('classroomMessage', 'Editando aula seleccionada.', 'info');
    } catch (err) {
      showMessage('classroomMessage', err.message, 'error');
    }
  } else if (action === 'delete') {
    if (!confirm('¿Deseas eliminar esta aula?')) return;
    try {
      await http(`${API.classrooms}/${id}`, { method: 'DELETE' });
      showMessage('classroomMessage', 'Aula eliminada.', 'success');
      if (state.editing.classroom === id) resetClassroomForm();
      await loadClassrooms();
    } catch (err) {
      showMessage('classroomMessage', err.message, 'error');
    }
  }
}

function resetStudentForm() {
  const form = document.getElementById('studentForm');
  form.reset();
  const hidden = form.querySelector('input[name="id"]');
  if (hidden) hidden.value = '';
  state.editing.student = null;
  document.getElementById('studentSubmit').textContent = 'Guardar estudiante';
  showMessage('studentMessage', '', 'info');
}

async function loadStudents() {
  try {
    const data = await http(`${API.students}/`);
    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.id ?? ''}</td>
        <td>${item.name ?? ''}</td>
        <td>${item.email ?? ''}</td>
        <td class="table-actions">
          <button class="secondary" data-action="edit" data-id="${item.id}">Editar</button>
          <button class="danger" data-action="delete" data-id="${item.id}">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showMessage('studentMessage', err.message, 'error');
  }
}

async function handleStudentSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const fd = new FormData(form);
  const payload = {
    name: fd.get('name')?.trim(),
    email: fd.get('email')?.trim()
  };
  const id = state.editing.student;
  try {
    if (id) {
      await http(`${API.students}/${id}`, { method: 'PUT', body: payload });
      showMessage('studentMessage', 'Estudiante actualizado.', 'success');
    } else {
      await http(`${API.students}/`, { method: 'POST', body: payload });
      showMessage('studentMessage', 'Estudiante creado.', 'success');
    }
    resetStudentForm();
    await loadStudents();
  } catch (err) {
    showMessage('studentMessage', err.message, 'error');
  }
}

async function handleStudentAction(event) {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'edit') {
    try {
      const data = await http(`${API.students}/${id}`);
      const form = document.getElementById('studentForm');
      form.name.value = data.name ?? '';
      form.email.value = data.email ?? '';
      const hidden = form.querySelector('input[name="id"]');
      if (hidden) hidden.value = data.id ?? '';
      state.editing.student = id;
      document.getElementById('studentSubmit').textContent = 'Actualizar estudiante';
      showMessage('studentMessage', 'Editando estudiante seleccionado.', 'info');
    } catch (err) {
      showMessage('studentMessage', err.message, 'error');
    }
  } else if (action === 'delete') {
    if (!confirm('¿Deseas eliminar este estudiante?')) return;
    try {
      await http(`${API.students}/${id}`, { method: 'DELETE' });
      showMessage('studentMessage', 'Estudiante eliminado.', 'success');
      if (state.editing.student === id) resetStudentForm();
      await loadStudents();
    } catch (err) {
      showMessage('studentMessage', err.message, 'error');
    }
  }
}

function resetLoanForm() {
  const form = document.getElementById('loanForm');
  form.reset();
  const hidden = form.querySelector('input[name="id"]');
  if (hidden) hidden.value = '';
  state.editing.loan = null;
  document.getElementById('loanSubmit').textContent = 'Guardar préstamo';
  showMessage('loanMessage', '', 'info');
}

async function loadLoans() {
  try {
    const data = await http(API.loans);
    const tbody = document.querySelector('#loanTable tbody');
    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.id ?? ''}</td>
        <td>${item.borrowerId ?? ''}</td>
        <td>${item.classroomId ?? ''}</td>
        <td>${item.status ?? ''}</td>
        <td>${item.loanDate ?? ''}</td>
        <td>${item.startHour ?? ''}</td>
        <td>${item.endHour ?? ''}</td>
        <td class="table-actions">
          <button class="secondary" data-action="edit" data-id="${item.id}">Editar</button>
          <button class="danger" data-action="delete" data-id="${item.id}">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showMessage('loanMessage', err.message, 'error');
  }
}

function extractLoanPayload(formData) {
  const payload = {
    borrowerId: formData.get('borrowerId')?.trim(),
    classroomId: formData.get('classroomId')?.trim(),
    status: formData.get('status')?.trim(),
    loanDate: formData.get('loanDate') || null,
    startHour: formData.get('startHour') !== '' ? Number(formData.get('startHour')) : null,
    endHour: formData.get('endHour') !== '' ? Number(formData.get('endHour')) : null
  };
  return payload;
}

async function handleLoanSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const fd = new FormData(form);
  const payload = extractLoanPayload(fd);
  const id = state.editing.loan;
  try {
    if (id) {
      await http(`${API.loans}/${id}`, { method: 'PUT', body: payload });
      showMessage('loanMessage', 'Préstamo actualizado.', 'success');
    } else {
      await http(API.loans, { method: 'POST', body: payload });
      showMessage('loanMessage', 'Préstamo creado.', 'success');
    }
    resetLoanForm();
    await loadLoans();
  } catch (err) {
    showMessage('loanMessage', err.message, 'error');
  }
}

async function handleLoanAction(event) {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'edit') {
    try {
      const data = await http(`${API.loans}/${id}`);
      const form = document.getElementById('loanForm');
      form.borrowerId.value = data.borrowerId ?? '';
      form.classroomId.value = data.classroomId ?? '';
      form.status.value = data.status ?? 'REQUESTED';
      form.loanDate.value = data.loanDate ?? '';
      form.startHour.value = data.startHour ?? '';
      form.endHour.value = data.endHour ?? '';
  const hidden = form.querySelector('input[name="id"]');
  if (hidden) hidden.value = data.id ?? '';
      state.editing.loan = id;
      document.getElementById('loanSubmit').textContent = 'Actualizar préstamo';
      showMessage('loanMessage', 'Editando préstamo seleccionado.', 'info');
    } catch (err) {
      showMessage('loanMessage', err.message, 'error');
    }
  } else if (action === 'delete') {
    if (!confirm('¿Deseas eliminar este préstamo?')) return;
    try {
      await http(`${API.loans}/${id}`, { method: 'DELETE' });
      showMessage('loanMessage', 'Préstamo eliminado.', 'success');
      if (state.editing.loan === id) resetLoanForm();
      await loadLoans();
    } catch (err) {
      showMessage('loanMessage', err.message, 'error');
    }
  }
}

async function loadMetrics() {
  try {
    const top = await http(`${API.metrics}/top-hour`);
    const text = top && top.hour != null
      ? `Hora ${top.hour}:00 con ${top.count} reservas`
      : 'Sin datos disponibles';
    document.getElementById('topHourText').textContent = text;
  } catch (err) {
    document.getElementById('topHourText').textContent = 'Error: ' + err.message;
  }

  try {
    const rows = await http(`${API.metrics}/classroom-frequency`);
    const tbody = document.querySelector('#metricsClassroomTable tbody');
    tbody.innerHTML = rows.map(row => `
      <tr>
        <td>${row.classroomId ?? ''}</td>
        <td>${row.count ?? 0}</td>
      </tr>
    `).join('');
    const labels = rows.map(r => r.classroomId);
    const data = rows.map(r => r.count);
    if (state.charts.classroomFrequency) {
      state.charts.classroomFrequency.destroy();
    }
    if (labels.length > 0 && window.Chart) {
      state.charts.classroomFrequency = new window.Chart(
        document.getElementById('classroomFrequencyChart'),
        {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Préstamos',
              data,
              backgroundColor: '#2563eb'
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, ticks: { precision: 0 } }
            }
          }
        }
      );
    }
  } catch (err) {
    document.querySelector('#metricsClassroomTable tbody').innerHTML = `<tr><td colspan="2">Error: ${err.message}</td></tr>`;
  }
}

function bindEvents() {
  document.getElementById('refreshAll').addEventListener('click', async () => {
    await Promise.all([loadClassrooms(), loadStudents(), loadLoans(), loadMetrics()]);
  });

  document.getElementById('classroomForm').addEventListener('submit', handleClassroomSubmit);
  document.getElementById('classroomCancel').addEventListener('click', resetClassroomForm);
  document.querySelector('#classroomTable tbody').addEventListener('click', handleClassroomAction);
  document.getElementById('classroomRefresh').addEventListener('click', loadClassrooms);

  document.getElementById('studentForm').addEventListener('submit', handleStudentSubmit);
  document.getElementById('studentCancel').addEventListener('click', resetStudentForm);
  document.querySelector('#studentTable tbody').addEventListener('click', handleStudentAction);
  document.getElementById('studentRefresh').addEventListener('click', loadStudents);

  document.getElementById('loanForm').addEventListener('submit', handleLoanSubmit);
  document.getElementById('loanCancel').addEventListener('click', resetLoanForm);
  document.querySelector('#loanTable tbody').addEventListener('click', handleLoanAction);
  document.getElementById('loanRefresh').addEventListener('click', loadLoans);

  document.getElementById('metricsRefresh').addEventListener('click', loadMetrics);
}

async function bootstrap() {
  renderLayout();
  bindEvents();
  resetClassroomForm();
  resetStudentForm();
  resetLoanForm();
  await Promise.all([loadClassrooms(), loadStudents(), loadLoans(), loadMetrics()]);
}

bootstrap().catch(err => {
  app.innerHTML = `<div class="error">Error inicializando la aplicación: ${err.message}</div>`;
});

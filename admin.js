// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyBOEZGzczHy9njwXDtNA7TlM-vEzngbFDw",
    authDomain: "domla-aliyev.firebaseapp.com",
    projectId: "domla-aliyev",
    storageBucket: "domla-aliyev.firebasestorage.app",
    messagingSenderId: "762189436245",
    appId: "1:762189436245:web:78132d7e3e036b942d4bdc"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// --- Preview Image ---
function previewAdminImg(input, previewId, labelId) {
    const file = input.files[0];
    if (!file) return;
    const preview = document.getElementById(previewId);
    const label = document.getElementById(labelId);
    const reader = new FileReader();
    reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = 'block';
        if (label) label.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// --- Upload File ---
const uploadFile = (file, path) => {
    return new Promise((resolve, reject) => {
        const ref = storage.ref(path);
        const task = ref.put(file);
        task.on('state_changed', null, reject, async () => {
            const url = await ref.getDownloadURL();
            resolve(url);
        });
    });
};

// --- Password ---
const ADMIN_PASSWORD = "admin810";

// --- State ---
let allStudents = [], pendingStudents = [], allPhotos = [], pendingPhotos = [];

// --- Login ---
function checkLogin() {
    const pw = document.getElementById('admin-password').value;
    if (pw === ADMIN_PASSWORD) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        initDashboard();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function logout() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-password').value = '';
}

// --- Tab Navigation ---
function showTab(name, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    const titles = {
        'overview': 'Umumiy Ko\'rinish',
        'pending-students': 'Kutilayotgan A\'zolar',
        'pending-photos': 'Kutilayotgan Rasmlar',
        'all-students': 'Barcha A\'zolar',
        'all-photos': 'Barcha Rasmlar'
    };
    document.getElementById('tab-title').textContent = titles[name] || name;
    if (el) el.classList.add('active');
}

// --- Toast ---
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show ' + type;
    setTimeout(() => t.className = 'toast', 3000);
}

// --- Render Pending Students ---
function renderPendingStudents() {
    const el = document.getElementById('pending-students-list');
    document.getElementById('badge-students').textContent = pendingStudents.length;
    document.getElementById('stat-pending-students').textContent = pendingStudents.length;
    if (pendingStudents.length === 0) {
        el.innerHTML = '<p class="empty-msg">✅ Hozircha kutilayotgan a\'zolar yo\'q.</p>'; return;
    }
    el.innerHTML = pendingStudents.map(s => `
        <div class="card">
            <img src="${s.img || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.name) + '&background=6366f1&color=fff&size=200'}" alt="${s.name}" class="card-img">
            <div class="card-body">
                <span class="card-role">${s.role}</span>
                <h4>${s.name}</h4>
                <p>${s.bio}</p>
                ${s.tg ? `<small>TG: ${s.tg}</small>` : ''}
                ${s.ig ? `<small>IG: ${s.ig}</small>` : ''}
            </div>
            <div class="card-actions">
                <button class="btn btn-primary btn-sm" onclick="approveStudent('${s.id}')">✅ Tasdiqlash</button>
                <button class="btn btn-danger btn-sm" onclick="rejectStudent('${s.id}')">❌ Rad etish</button>
            </div>
        </div>
    `).join('');
}

// --- Render Pending Photos ---
function renderPendingPhotos() {
    const el = document.getElementById('pending-photos-list');
    document.getElementById('badge-photos').textContent = pendingPhotos.length;
    document.getElementById('stat-pending-photos').textContent = pendingPhotos.length;
    if (pendingPhotos.length === 0) {
        el.innerHTML = '<p class="empty-msg">✅ Hozircha kutilayotgan rasmlar yo\'q.</p>'; return;
    }
    el.innerHTML = pendingPhotos.map(p => `
        <div class="card">
            <img src="${p.img}" alt="${p.title}" class="card-img photo-img">
            <div class="card-body">
                <h4>${p.title}</h4>
            </div>
            <div class="card-actions">
                <button class="btn btn-primary btn-sm" onclick="approvePhoto('${p.id}')">✅ Tasdiqlash</button>
                <button class="btn btn-danger btn-sm" onclick="rejectPhoto('${p.id}')">❌ Rad etish</button>
            </div>
        </div>
    `).join('');
}

// --- Render All Students ---
function renderAllStudents() {
    const el = document.getElementById('all-students-list');
    document.getElementById('stat-total-students').textContent = allStudents.length;
    if (allStudents.length === 0) {
        el.innerHTML = '<p class="empty-msg">Hozircha a\'zolar yo\'q.</p>'; return;
    }
    el.innerHTML = allStudents.map(s => `
        <div class="card">
            <img src="${s.img || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.name) + '&background=6366f1&color=fff&size=200'}" alt="${s.name}" class="card-img">
            <div class="card-body">
                <span class="card-role">${s.role}</span>
                <h4>${s.name}</h4>
                <p>${s.bio}</p>
            </div>
            <div class="card-actions">
                <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.id}')">🗑️ O'chirish</button>
            </div>
        </div>
    `).join('');
}

// --- Render All Photos ---
function renderAllPhotos() {
    const el = document.getElementById('all-photos-list');
    document.getElementById('stat-total-photos').textContent = allPhotos.length;
    if (allPhotos.length === 0) {
        el.innerHTML = '<p class="empty-msg">Hozircha rasmlar yo\'q.</p>'; return;
    }
    el.innerHTML = allPhotos.map(p => `
        <div class="card">
            <img src="${p.img}" alt="${p.title}" class="card-img photo-img">
            <div class="card-body">
                <h4>${p.title}</h4>
            </div>
            <div class="card-actions">
                <button class="btn btn-danger btn-sm" onclick="deletePhoto('${p.id}')">🗑️ O'chirish</button>
            </div>
        </div>
    `).join('');
}

// --- Firestore Actions ---
async function approveStudent(id) {
    const s = pendingStudents.find(x => x.id === id);
    if (!s) return;
    try {
        await db.collection('810-23-students').add({ name: s.name, role: s.role, bio: s.bio, img: s.img || null, tg: s.tg || null, ig: s.ig || null, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        await db.collection('810-23-pending-students').doc(id).delete();
        showToast("A'zo tasdiqlandi! ✅");
    } catch(e) { showToast("Xatolik: " + e.message, 'error'); }
}

async function rejectStudent(id) {
    if (!confirm("Bu a'zoni rad etmoqchimisiz?")) return;
    try {
        await db.collection('810-23-pending-students').doc(id).delete();
        showToast("A'zo rad etildi.", 'error');
    } catch(e) { showToast("Xatolik: " + e.message, 'error'); }
}

async function deleteStudent(id) {
    if (!confirm("Bu a'zoni o'chirmoqchimisiz?")) return;
    try {
        await db.collection('810-23-students').doc(id).delete();
        showToast("A'zo o'chirildi.", 'error');
    } catch(e) { showToast("Xatolik: " + e.message, 'error'); }
}

async function approvePhoto(id) {
    const p = pendingPhotos.find(x => x.id === id);
    if (!p) return;
    try {
        await db.collection('810-23-gallery').add({ title: p.title, img: p.img, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        await db.collection('810-23-pending-gallery').doc(id).delete();
        showToast("Rasm tasdiqlandi! ✅");
    } catch(e) { showToast("Xatolik: " + e.message, 'error'); }
}

async function rejectPhoto(id) {
    if (!confirm("Bu rasmni rad etmoqchimisiz?")) return;
    try {
        await db.collection('810-23-pending-gallery').doc(id).delete();
        showToast("Rasm rad etildi.", 'error');
    } catch(e) { showToast("Xatolik: " + e.message, 'error'); }
}

async function deletePhoto(id) {
    if (!confirm("Bu rasmni o'chirmoqchimisiz?")) return;
    try {
        await db.collection('810-23-gallery').doc(id).delete();
        showToast("Rasm o'chirildi.", 'error');
    } catch(e) { showToast("Xatolik: " + e.message, 'error'); }
}

// --- Init Dashboard & Listeners ---
function initDashboard() {
    db.collection('810-23-students').orderBy('createdAt', 'desc').onSnapshot(snap => {
        allStudents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderAllStudents();
    });
    db.collection('810-23-pending-students').orderBy('createdAt', 'desc').onSnapshot(snap => {
        pendingStudents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderPendingStudents();
    });
    db.collection('810-23-gallery').orderBy('createdAt', 'desc').onSnapshot(snap => {
        allPhotos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderAllPhotos();
    });
    db.collection('810-23-pending-gallery').orderBy('createdAt', 'desc').onSnapshot(snap => {
        pendingPhotos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderPendingPhotos();
    });

    // Add student form
    document.getElementById('add-student-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button'); btn.disabled = true; btn.innerText = 'Yuklanmoqda...';
        try {
            const fileInput = document.getElementById('ns-img');
            let imgUrl = null;
            if (fileInput.files[0]) {
                imgUrl = await uploadFile(fileInput.files[0], `810-23/students/${Date.now()}_${fileInput.files[0].name}`);
            }
            await db.collection('810-23-students').add({
                name: document.getElementById('ns-name').value.trim(),
                role: document.getElementById('ns-role').value.trim(),
                bio: document.getElementById('ns-bio').value.trim(),
                img: imgUrl,
                tg: document.getElementById('ns-tg').value.trim() || null,
                ig: document.getElementById('ns-ig').value.trim() || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            e.target.reset();
            document.getElementById('ns-img-preview').style.display = 'none';
            document.getElementById('ns-img-label').style.display = 'block';
            showToast("A'zo qo'shildi! ✅");
        } catch(err) { showToast("Xatolik: " + err.message, 'error'); }
        finally { btn.disabled = false; btn.innerText = "Qo'shish"; }
    });

    // Add photo form
    document.getElementById('add-photo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button'); btn.disabled = true; btn.innerText = 'Yuklanmoqda...';
        try {
            const fileInput = document.getElementById('np-img');
            let imgUrl = null;
            if (fileInput.files[0]) {
                imgUrl = await uploadFile(fileInput.files[0], `810-23/gallery/${Date.now()}_${fileInput.files[0].name}`);
            }
            await db.collection('810-23-gallery').add({
                title: document.getElementById('np-title').value.trim(),
                img: imgUrl,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            e.target.reset();
            document.getElementById('np-img-preview').style.display = 'none';
            document.getElementById('np-img-label').style.display = 'block';
            showToast("Rasm qo'shildi! ✅");
        } catch(err) { showToast("Xatolik: " + err.message, 'error'); }
        finally { btn.disabled = false; btn.innerText = "Qo'shish"; }
    });
}

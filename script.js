// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyBOEZGzczHy9njwXDtNA7TlM-vEzngbFDw",
    authDomain: "domla-aliyev.firebaseapp.com",
    projectId: "domla-aliyev",
    storageBucket: "domla-aliyev.firebasestorage.app",
    messagingSenderId: "762189436245",
    appId: "1:762189436245:web:78132d7e3e036b942d4bdc",
    measurementId: "G-PLR0EHDC9Q"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let students = [];
    let galleryPhotos = [];
    let pendingPhotos = [];

    // --- Selectors ---
    const studentGrid = document.getElementById('student-grid');
    const galleryGrid = document.getElementById('gallery-grid');
    const nav = document.getElementById('main-nav');
    const joinModal = document.getElementById('join-modal');
    const joinForm = document.getElementById('join-form');
    const photoModal = document.getElementById('photo-modal');
    const photoForm = document.getElementById('photo-form');
    const adminSection = document.getElementById('admin-section');
    const pendingPhotosList = document.getElementById('pending-photos-list');

    // --- Functions ---

    // Render Students
    const renderStudents = () => {
        if (!studentGrid) return;
        studentGrid.innerHTML = students.map(student => `
            <div class="student-card animate-on-scroll">
                <img src="${student.img || 'https://via.placeholder.com/150'}" alt="${student.name}" class="student-img">
                <span class="role">${student.role}</span>
                <h3>${student.name}</h3>
                <p>${student.bio}</p>
                <div class="student-socials">
                    ${student.tg ? `<a href="https://t.me/${student.tg.replace('@', '')}" class="social-icon">TG</a>` : ''}
                    ${student.ig ? `<a href="https://instagram.com/${student.ig}" class="social-icon">IG</a>` : ''}
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    };

    // Render Gallery
    const renderGallery = () => {
        if (!galleryGrid) return;
        // Static items + DB items
        const staticItems = [
            { title: "Dars jarayoni", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" },
            { title: "Tanaffusda", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" },
            { title: "Bayram tadbiri", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800" }
        ];

        const allPhotos = [...staticItems, ...galleryPhotos];

        galleryGrid.innerHTML = allPhotos.map(item => `
            <div class="gallery-item animate-on-scroll">
                <img src="${item.img}" alt="${item.title}">
                <div class="gallery-overlay">
                    <span>${item.title}</span>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    };

    // Modal Controls
    window.openJoinModal = () => { joinModal.classList.add('active'); document.body.style.overflow = 'hidden'; };
    window.closeJoinModal = () => { joinModal.classList.remove('active'); document.body.style.overflow = 'auto'; };
    
    window.openPhotoModal = () => { photoModal.classList.add('active'); document.body.style.overflow = 'hidden'; };
    window.closePhotoModal = () => { photoModal.classList.remove('active'); document.body.style.overflow = 'auto'; };

    // Firebase Data Fetch
    const fetchData = () => {
        // Students
        db.collection("810-23-students").orderBy("createdAt", "desc")
            .onSnapshot(snapshot => {
                students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderStudents();
            });

        // Approved Gallery
        db.collection("810-23-gallery").orderBy("createdAt", "desc")
            .onSnapshot(snapshot => {
                galleryPhotos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderGallery();
            });

        // Pending (Only if admin)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') {
            adminSection.style.display = 'block';
            db.collection("810-23-pending-gallery").orderBy("createdAt", "desc")
                .onSnapshot(snapshot => {
                    pendingPhotos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    renderAdminPanel();
                });
        }
    };

    // Render Admin Panel
    const renderAdminPanel = () => {
        if (!pendingPhotosList) return;
        pendingPhotosList.innerHTML = pendingPhotos.map(photo => `
            <div class="admin-item">
                <img src="${photo.img}" alt="${photo.title}">
                <h4>${photo.title}</h4>
                <div class="admin-item-actions">
                    <button class="btn btn-primary btn-sm" onclick="approvePhoto('${photo.id}')">Tasdiqlash</button>
                    <button class="btn btn-outline btn-sm" onclick="deletePhoto('${photo.id}')">O'chirish</button>
                </div>
            </div>
        `).join('');
        if (pendingPhotos.length === 0) {
            pendingPhotosList.innerHTML = "<p>Hozircha kutilayotgan rasmlar yo'q.</p>";
        }
    };

    // Admin Actions
    window.approvePhoto = async (id) => {
        const photo = pendingPhotos.find(p => p.id === id);
        if (!photo) return;
        try {
            await db.collection("810-23-gallery").add({
                title: photo.title,
                img: photo.img,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await db.collection("810-23-pending-gallery").doc(id).delete();
            alert("Rasm tasdiqlandi!");
        } catch (e) { alert("Xatolik: " + e.message); }
    };

    window.deletePhoto = async (id) => {
        if (confirm("Ushbu rasmni o'chirmoqchimisiz?")) {
            try {
                await db.collection("810-23-pending-gallery").doc(id).delete();
                alert("Rasm o'chirildi.");
            } catch (e) { alert("Xatolik: " + e.message); }
        }
    };

    // Forms Submit
    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = joinForm.querySelector('button'); btn.disabled = true; btn.innerText = "Yuborilmoqda...";
            const newMember = {
                name: document.getElementById('join-name').value.trim(),
                role: document.getElementById('join-role').value.trim(),
                bio: document.getElementById('join-bio').value.trim(),
                img: document.getElementById('join-img').value.trim() || null,
                tg: document.getElementById('join-tg').value.trim() || null,
                ig: document.getElementById('join-ig').value.trim() || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            try {
                await db.collection("810-23-students").add(newMember);
                joinForm.reset(); closeJoinModal(); alert("Muvaffaqiyatli qo'shildingiz!");
            } catch (error) { alert("Xatolik: " + error.message + "\n\nFirestore qoidalarini tekshiring."); }
            finally { btn.disabled = false; btn.innerText = "Ro'yxatdan o'tish"; }
        });
    }

    if (photoForm) {
        photoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = photoForm.querySelector('button'); btn.disabled = true; btn.innerText = "Yuborilmoqda...";
            const newPhoto = {
                title: document.getElementById('photo-title').value.trim(),
                img: document.getElementById('photo-img').value.trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            try {
                await db.collection("810-23-pending-gallery").add(newPhoto);
                photoForm.reset(); closePhotoModal(); alert("Rasm yuborildi! Admin tasdiqlaganidan so'ng ko'rinadi.");
            } catch (error) { alert("Xatolik: " + error.message); }
            finally { btn.disabled = false; btn.innerText = "Yuborish"; }
        });
    }

    // Scroll Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    fetchData();
});

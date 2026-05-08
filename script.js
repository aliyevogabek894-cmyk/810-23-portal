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

// --- Utility: Resize image and convert to base64 ---
const resizeImageToBase64 = (file, maxSize = 400) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > h) { if (w > maxSize) { h = h * maxSize / w; w = maxSize; } }
                else { if (h > maxSize) { w = w * maxSize / h; h = maxSize; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

// --- Utility: Preview selected image ---
window.previewImg = (input, previewId, labelId) => {
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
};

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let students = [];
    let galleryPhotos = [];

    // --- Selectors ---
    const studentGrid = document.getElementById('student-grid');
    const galleryGrid = document.getElementById('gallery-grid');
    const nav = document.getElementById('main-nav');
    const joinModal = document.getElementById('join-modal');
    const joinForm = document.getElementById('join-form');
    const photoModal = document.getElementById('photo-modal');
    const photoForm = document.getElementById('photo-form');
    const profileModal = document.getElementById('profile-modal');
    const postForm = document.getElementById('post-form');

    // --- Render Students ---
    const renderStudents = () => {
        if (!studentGrid) return;
        studentGrid.innerHTML = students.map(student => `
            <div class="student-card animate-on-scroll" onclick="openProfileModal('${student.id}')">
                <img src="${student.img || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(student.name) + '&background=6366f1&color=fff&size=200'}" alt="${student.name}" class="student-img">
                <span class="role">${student.role}</span>
                <h3>${student.name}</h3>
                <p>${student.bio}</p>
                <div class="student-socials">
                    ${student.tg ? `<a href="https://t.me/${student.tg.replace('@', '')}" class="social-icon" onclick="event.stopPropagation()">TG</a>` : ''}
                    ${student.ig ? `<a href="https://instagram.com/${student.ig}" class="social-icon" onclick="event.stopPropagation()">IG</a>` : ''}
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    };

    // --- Render Gallery ---
    const renderGallery = () => {
        if (!galleryGrid) return;
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

    // --- Modal Controls ---
    window.openJoinModal = () => { joinModal.classList.add('active'); document.body.style.overflow = 'hidden'; };
    window.closeJoinModal = () => { joinModal.classList.remove('active'); document.body.style.overflow = 'auto'; };
    window.openPhotoModal = () => { photoModal.classList.add('active'); document.body.style.overflow = 'hidden'; };
    window.closePhotoModal = () => { photoModal.classList.remove('active'); document.body.style.overflow = 'auto'; };
    
    window.openProfileModal = (id) => {
        const s = students.find(x => x.id === id);
        if (!s) return;
        
        document.getElementById('profile-detail').innerHTML = `
            <div class="profile-header">
                <img src="${s.img || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.name) + '&background=6366f1&color=fff&size=200'}" alt="${s.name}">
                <div class="profile-info">
                    <span class="role">${s.role}</span>
                    <h2>${s.name}</h2>
                    <p>${s.bio}</p>
                    <div class="student-socials" style="justify-content: flex-start; margin-top: 1rem;">
                        ${s.tg ? `<a href="https://t.me/${s.tg.replace('@', '')}" class="social-icon">TG</a>` : ''}
                        ${s.ig ? `<a href="https://instagram.com/${s.ig}" class="social-icon">IG</a>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('post-member-id').value = id;
        profileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        fetchPosts(id);
    };
    
    window.closeProfileModal = () => {
        profileModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    // --- Firebase Data Fetch ---
    const fetchData = () => {
        db.collection("810-23-students").orderBy("createdAt", "desc")
            .onSnapshot(snapshot => {
                students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderStudents();
            });

        db.collection("810-23-gallery").orderBy("createdAt", "desc")
            .onSnapshot(snapshot => {
                galleryPhotos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderGallery();
            });
    };

    // --- Posts Logic ---
    const fetchPosts = (studentId) => {
        const postsList = document.getElementById('profile-posts');
        postsList.innerHTML = '<p>Yuklanmoqda...</p>';
        
        db.collection("810-23-posts")
            .where("studentId", "==", studentId)
            .orderBy("createdAt", "desc")
            .onSnapshot(snapshot => {
                const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (posts.length === 0) {
                    postsList.innerHTML = '<p class="empty-msg">Hozircha postlar yo\'q.</p>';
                } else {
                    postsList.innerHTML = posts.map(p => `
                        <div class="post-item">
                            <p>${p.text}</p>
                            ${p.img ? `<img src="${p.img}" alt="Post image">` : ''}
                            <small>${p.createdAt ? new Date(p.createdAt.toDate()).toLocaleString() : 'Hozirgina'}</small>
                        </div>
                    `).join('');
                }
            });
    };

    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const studentId = document.getElementById('post-member-id').value;
            const text = document.getElementById('post-text').value.trim();
            const img = document.getElementById('post-img').value.trim();
            const btn = postForm.querySelector('button');
            
            btn.disabled = true; btn.innerText = 'Yuborilmoqda...';
            try {
                await db.collection("810-23-posts").add({
                    studentId,
                    text,
                    img: img || null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                postForm.reset();
            } catch (err) { alert("Xatolik: " + err.message); }
            finally { btn.disabled = false; btn.innerText = 'Post joylash'; }
        });
    }

    // --- Join Form Submit ---
    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = joinForm.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerText = "Yuklanmoqda...";
            try {
                const fileInput = document.getElementById('join-img');
                let imgUrl = null;
                if (fileInput.files[0]) {
                    imgUrl = await resizeImageToBase64(fileInput.files[0], 400);
                }
                const newMember = {
                    name: document.getElementById('join-name').value.trim(),
                    role: document.getElementById('join-role').value.trim(),
                    bio: document.getElementById('join-bio').value.trim(),
                    img: imgUrl,
                    tg: document.getElementById('join-tg').value.trim() || null,
                    ig: document.getElementById('join-ig').value.trim() || null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await db.collection("810-23-pending-students").add(newMember);
                joinForm.reset();
                document.getElementById('join-img-preview').style.display = 'none';
                document.getElementById('join-img-label').style.display = 'block';
                closeJoinModal();
                alert("Arizangiz qabul qilindi! Admin tasdiqlashini kuting.");
            } catch (error) {
                alert("Xatolik: " + error.message);
            } finally {
                btn.disabled = false; btn.innerText = "Ro'yxatdan o'tish";
            }
        });
    }

    // --- Photo Form Submit ---
    if (photoForm) {
        photoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = photoForm.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerText = "Yuklanmoqda...";
            try {
                const fileInput = document.getElementById('photo-img');
                let imgUrl = null;
                if (fileInput.files[0]) {
                    imgUrl = await resizeImageToBase64(fileInput.files[0], 800);
                }
                const newPhoto = {
                    title: document.getElementById('photo-title').value.trim(),
                    img: imgUrl,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await db.collection("810-23-pending-gallery").add(newPhoto);
                photoForm.reset();
                document.getElementById('photo-img-preview').style.display = 'none';
                document.getElementById('photo-img-label').style.display = 'block';
                closePhotoModal();
                alert("Rasm yuborildi! Admin tasdiqlaganidan so'ng ko'rinadi.");
            } catch (error) {
                alert("Xatolik: " + error.message);
            } finally {
                btn.disabled = false; btn.innerText = "Yuborish";
            }
        });
    }

    // --- Scroll Observer ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    fetchData();
});

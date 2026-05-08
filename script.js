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

    const galleryItems = [
        { title: "Dars jarayoni", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" },
        { title: "Tanaffusda", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" },
        { title: "Bayram tadbiri", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800" },
        { title: "Imtihon oldidan", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800" },
        { title: "Guruh sayohati", img: "https://images.unsplash.com/photo-1539635278303-d4002c07dee3?auto=format&fit=crop&q=80&w=800" }
    ];

    // --- Selectors ---
    const studentGrid = document.getElementById('student-grid');
    const galleryGrid = document.getElementById('gallery-grid');
    const nav = document.getElementById('main-nav');
    const joinModal = document.getElementById('join-modal');
    const joinForm = document.getElementById('join-form');

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
        
        // Re-observe dynamic elements
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    };

    // Render Gallery
    const renderGallery = () => {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = galleryItems.map(item => `
            <div class="gallery-item animate-on-scroll">
                <img src="${item.img}" alt="${item.title}">
                <div class="gallery-overlay">
                    <span>${item.title}</span>
                </div>
            </div>
        `).join('');
    };

    // Modal Control
    window.openJoinModal = () => {
        joinModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeJoinModal = () => {
        joinModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    // Firebase Data Fetch
    const fetchStudents = () => {
        db.collection("810-23-students").orderBy("createdAt", "desc")
            .onSnapshot((snapshot) => {
                students = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                renderStudents();
            });
    };

    // Join Form Submit
    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = joinForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.innerText = "Yuborilmoqda...";

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
                joinForm.reset();
                closeJoinModal();
                alert("Tabriklaymiz! Siz guruhga muvaffaqiyatli qo'shildingiz.");
            } catch (error) {
                console.error("Xatolik:", error);
                alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "Ro'yxatdan o'tish";
            }
        });
    }

    // Scroll Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    // Navigation Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Initialize
    fetchStudents();
    renderGallery();

    // Observe initial elements
    document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
});

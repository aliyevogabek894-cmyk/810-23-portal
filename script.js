document.addEventListener('DOMContentLoaded', () => {
    // --- Data ---
    const students = [
        {
            name: "Ali Aliyev",
            role: "Guruh Sardori",
            bio: "Tashabbuskor va har doim yordamga tayyor. Dasturlashga qiziqadi.",
            img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
            social: { telegram: "#", instagram: "#" }
        },
        {
            name: "Malika Rasulova",
            role: "Talaba",
            bio: "A'lochi va ijodkor. Dizayn va san'atni yaxshi ko'radi.",
            img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
            social: { telegram: "#", instagram: "#" }
        },
        {
            name: "Jasur Karimov",
            role: "Talaba",
            bio: "Sportchi va faol talaba. Doimo harakatda.",
            img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
            social: { telegram: "#", instagram: "#" }
        },
        {
            name: "Shahnoza Orifova",
            role: "Talaba",
            bio: "Tillar o'rganishga ishqiboz. Ingliz tilini mukammal biladi.",
            img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
            social: { telegram: "#", instagram: "#" }
        }
    ];

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
    const animateElements = document.querySelectorAll('.animate-up, .animate-on-scroll');

    // --- Functions ---

    // Render Students
    const renderStudents = () => {
        studentGrid.innerHTML = students.map(student => `
            <div class="student-card animate-on-scroll">
                <img src="${student.img}" alt="${student.name}" class="student-img">
                <span class="role">${student.role}</span>
                <h3>${student.name}</h3>
                <p>${student.bio}</p>
                <div class="student-socials">
                    <a href="${student.social.telegram}" class="social-icon">TG</a>
                    <a href="${student.social.instagram}" class="social-icon">IG</a>
                </div>
            </div>
        `).join('');
    };

    // Render Gallery
    const renderGallery = () => {
        galleryGrid.innerHTML = galleryItems.map(item => `
            <div class="gallery-item animate-on-scroll">
                <img src="${item.img}" alt="${item.title}">
                <div class="gallery-overlay">
                    <span>${item.title}</span>
                </div>
            </div>
        `).join('');
    };

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
    renderStudents();
    renderGallery();

    // Observe initial elements
    document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
    // Observe dynamic elements after a short delay to ensure they are rendered
    setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }, 100);
});

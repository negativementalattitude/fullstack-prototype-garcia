function navigateTo(hash) {
    window.location.hash = hash;
}

// --- ROUTER (The Traffic Cop) ---
function handleRouting() {
    // 1. Get the current URL hash (default to #/home)
    const hash = window.location.hash || '#/home';

    // 2. Hide ALL pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 3. Decide which page to show
    let pageId = 'home-page';

    switch(hash) {
        case '#/home':
            pageId = 'home-page';
            break;
        
        case '#/register':
            // If already logged in, redirect to profile
            if (currentUser) { navigateTo('#/profile'); return; }
            pageId = 'register-page';
            break;

        case '#/login':
            // If already logged in, redirect to profile
            if (currentUser) { navigateTo('#/profile'); return; }
            pageId = 'login-page';
            break;

        case '#/profile':
            // PROTECTED: Must be logged in
            if (!currentUser) {
                navigateTo('#/login');
                return;
            }
            pageId = 'profile-page';
            break;

        case '#/employees':
            // ADMIN ONLY: Must be admin
            if (!currentUser || currentUser.role !== 'admin') {
                alert("Access Denied: Admins Only");
                navigateTo('#/home');
                return;
            }
            pageId = 'employees-page';
            break;

        default:
            pageId = 'home-page';
    }

    // 4. Show the chosen page
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
}
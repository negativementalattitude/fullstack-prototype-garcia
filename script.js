let currentUser = null;

function navigateTo(hash){
    window.location.hash=hash;
}

function handleRouting(){
    const hash = window.location.hash || '#home';

    document.querySelectorAll('.page').forEach(page =>{
        page.classList.remove('active');
    });

    let pageId='home-page';

    switch(hash){

        case '#/home':
            pageId ='home-page';
            break;
        case '#/register':
            if(currentUser) {navigateTo('#/profile');return};
            pageId ='register-page';
            break;
        case '#/login':
            if(currentUser) {navigateTo('#/profile');return};
            pageId ='login-page';
            break;
        case '#/profile':
            if(!currentUser) {navigateTo('#/login');
            return;
            }
            
            pageId='profile-page';
            break;

        case '#/employees':
            if(!currentUser || currentUser.role !== 'admin') {
                alert("Access Denied: Admin Only!");
                navigateTo('#/home');
                return;
            }

            pageId='employees-page';
            break;
            
        default:
            pageId='home-page';
    }
    
    const activePage=document.getElementById(pageId);
    if(activePage){
        activePage.classList.add('active');
    }
}

window.addEventListener('hashchange',handleRouting);

window.addEventListener('load',handleRouting);

function logout () {
    currentUser=null;
    document.body.classList.remove('authenticated');
    document.body.classList.add('not-authenticated');
    navigateTo('#/home');
}
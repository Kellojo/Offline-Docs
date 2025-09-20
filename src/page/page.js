const pages = JSON.parse(document.getElementById('contentJson').textContent);

const buildNavBar = (pages, parent = null) => {
    const navBar = document.querySelector('nav ul');

    const entries = Object.keys(pages);
    const sortedEntries = entries.sort((a, b) => {
        return pages[a].order - pages[b].order;
    });

    sortedEntries.forEach(key => {
        const page = pages[key];

        if (page.isPage) {
            const li = document.createElement('li');
            li.classList.add('navBarItem');
            if (parent !== null) li.classList.add('subNavBarItem');
            li.textContent = page.title;
            li.setAttribute('title', page.title);
            li.setAttribute('data-pageId', page.id);
            li.setAttribute('data-isPage', 'true');
            li.tabIndex = 0;
            navBar.appendChild(li);
        } else {
            const submenuHeader = document.createElement('li');
            submenuHeader.classList.add('submenuHeader');
            submenuHeader.classList.add('navBarItem');
            submenuHeader.tabIndex = -1;
            submenuHeader.textContent = page.title;
            navBar.appendChild(submenuHeader);
            buildNavBar(page.entries, submenuHeader);
        }
    });
}
buildNavBar(pages);

const getPageById = (id, entries) => {
    entries = entries || pages;
    for (const key in entries) {
        const page = entries[key];
        if (page.isPage && page.id === id) {
            return page;
        } else if (!page.isPage && page.entries) {
            const p = getPageById(id, page.entries);
            if (p) return p;
        }
    }
    return null;
}

const pageContent = document.getElementById('pageContent');
const navBarItems = document.querySelectorAll('.navBarItem');
navBarItems.forEach(item => {
    item.addEventListener('click', () => {
        navigateTo(item.getAttribute('data-pageId'));
    });
});

const getHeadingTarget = (hash) => {
    if (!hash) return null;
    if (hash.startsWith('#')) hash = hash.substring(1);

    const parsedUrl = new URL(hash, window.location.origin);
    const params = new URLSearchParams(parsedUrl.search);

    if (!params.has("h")) return null;
    return params.get("h");
}

const navigateTo = (hash) => {
    const pageId = hash.split('?')[0];
    const page = getPageById(pageId);
    if (!page) return false;
    if (!page.isPage) return false;

    const selectedItem = document.querySelector('.navBarItemSelected');
    if (selectedItem) selectedItem.classList.remove('navBarItemSelected');

    const targetItem = Array.from(navBarItems).find(item => item.getAttribute('data-pageId') === pageId);
    if (targetItem) targetItem.classList.add('navBarItemSelected');

    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = page.content;

    window.offlineDocsCurrentPage = pageId;
    window.location.hash = `#${pageId}`;

    const headingTarget = getHeadingTarget(hash);
    if (headingTarget) {
        const headingElement = document.getElementById(headingTarget);
        if (headingElement) {
            headingElement.scrollIntoView();
        }
    } else {
        window.scrollTo(0, 0);
    }

    console.log('Navigated to page:', pageId);
    return true;
}

// Show initial page based on URL hash
const hash = window.location.hash.substring(1);
if (!navigateTo(hash)) 
    navBarItems[0].click(); // navigate to first page if hash is invalid

// Handle hash changes (e.g. back/forward navigation)
window.addEventListener('hashchange', (event) => {
    const hash = window.location.hash.substring(1);
    if (!hash) return;
    if (hash === window.offlineDocsCurrentPage) return; // filter out self triggered hash changes
    navigateTo(hash);
});
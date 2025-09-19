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

const getPageContentById = (id, entries) => {
    entries = entries || pages;
    for (const key in entries) {
        const page = entries[key];
        if (page.isPage && page.id === id) {
            return page.content;
        } else if (!page.isPage && page.entries) {
            const content = getPageContentById(id, page.entries);
            if (content) return content;
        }
    }
    return null;
}

const setSelectedNavItem = (item) => {
    const bIsNewItemValid = item.getAttribute('data-isPage') === 'true';
    if (!bIsNewItemValid) return;

    const pageId = item.getAttribute('data-pageId');
    const newContent = getPageContentById(pageId);

    const selectedItem = document.querySelector('.navBarItemSelected');
    if (selectedItem) selectedItem.classList.remove('navBarItemSelected');
    item.classList.add('navBarItemSelected');


    const pageContent = document.getElementById('pageContent');
    pageContent.innerHTML = newContent;
    window.location.hash = item.getAttribute('data-pageId');

    window.scrollTo(0, 0);
}

const pageContent = document.getElementById('pageContent');
const navBarItems = document.querySelectorAll('.navBarItem');
navBarItems.forEach(item => {
    item.addEventListener('click', () => {
        setSelectedNavItem(item);
    });
});


const showInitialPage = () => {
    const hash = window.location.hash.substring(1);

    if (hash) {
        const targetItem = Array.from(navBarItems).find(item => item.getAttribute('data-pageId') === hash);
        if (targetItem) {
            setSelectedNavItem(targetItem);
            targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }

    navBarItems[0].click();
}
showInitialPage();

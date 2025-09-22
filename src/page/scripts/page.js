const pages = JSON.parse(document.getElementById('contentJson').textContent);
const flatPagesList = [];
iteratePages((page) => flatPagesList.push(page));

const buildNavBar = (pages, parent = null) => {
    const navBar = document.querySelector('nav ul');

    const entries = Object.keys(pages);
    const sortedEntries = entries.sort((a, b) => {
        return pages[a].order - pages[b].order;
    });

    sortedEntries.forEach((key) => {
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
};
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
};

function iteratePages(callback, entries) {
    entries = entries || pages;
    for (const key in entries) {
        const page = entries[key];
        if (page.isPage) {
            callback(page);
        } else if (!page.isPage && page.entries) {
            iteratePages(callback, page.entries);
        }
    }
}

// Embed images from cache
iteratePages((page) => {
    const imageCache = window.imageCache || {};
    if (!page.content) return;

    const images = Object.keys(imageCache);
    images.forEach((img) => {
        const dataUrl = imageCache[img];
        page.content = page.content.replaceAll(img, dataUrl);
    });
}, pages);

const pageContent = document.getElementById('pageContent');
const navBarItems = document.querySelectorAll('.navBarItem');
navBarItems.forEach((item) => {
    item.addEventListener('click', () => {
        navigateTo(item.getAttribute('data-pageId'));
    });

    item.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            item.click();
        }
    });
});

const getHeadingTarget = (hash) => {
    if (!hash) return null;
    if (hash.startsWith('#')) hash = hash.substring(1);

    const parsedUrl = new URL(hash, window.location.origin);
    const params = new URLSearchParams(parsedUrl.search);

    if (!params.has('h')) return null;
    return params.get('h');
};

const navigateTo = (hash) => {
    if (!hash) return false;

    const pageId = hash.split('?')[0];
    const page = getPageById(pageId);
    if (!page) return false;
    if (!page.isPage) return false;

    const selectedItem = document.querySelector('.navBarItemSelected');
    if (selectedItem) selectedItem.classList.remove('navBarItemSelected');

    const targetItem = Array.from(navBarItems).find(
        (item) => item.getAttribute('data-pageId') === pageId
    );
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
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 0);
    }

    toggleMobileMenu(false);

    console.log('Navigated to page:', pageId);
    return true;
};

// Show initial page based on URL hash
const hash = window.location.hash.substring(1);
if (!navigateTo(hash)) navBarItems[0].click(); // navigate to first page if hash is invalid

// Handle hash changes (e.g. back/forward navigation)
window.addEventListener('hashchange', (event) => {
    const hash = window.location.hash.substring(1);
    if (!hash) return;
    if (hash === window.offlineDocsCurrentPage) return; // filter out self triggered hash changes
    navigateTo(hash);
});

function toggleMobileMenu(hidden) {
    const nav = document.querySelector('nav');

    if (typeof hidden !== 'boolean') {
        hidden = nav.classList.contains('mobileHidden');
    }

    nav.classList.toggle('mobileHidden', !hidden);

    const button = document.getElementById('mobileMenuButton');
    button.classList.toggle('active', hidden);
}

document
    .getElementById('mobileMenuButton')
    .addEventListener('click', () => toggleMobileMenu());

class SearchModal {
    constructor() {
        this.modal = document.getElementById('searchDialog');
        this.modal.addEventListener('close', this.onClose.bind(this));
        window.addEventListener('keydown', this.onKeydown.bind(this));

        this.searchInput = this.modal.querySelector('input');
        this.searchInput.addEventListener('input', this.onSearch.bind(this));

        this.searchResults = this.modal.querySelector('#searchResults');

        window.addEventListener('load', () => {
            this.fuse = new Fuse(flatPagesList, {
                keys: ['title', 'textContent', 'id'],
                includeMatches: true,
                minMatchCharLength: 2,
            });
        });
    }

    onKeydown(event) {
        if (
            event.target.tagName === 'INPUT' ||
            event.target.tagName === 'TEXTAREA'
        )
            return;

        if (
            event.key === 'Escape' &&
            document.activeElement === this.searchInput
        ) {
            this.close();
            return;
        }

        if (
            (event.key === 'k' && (event.ctrlKey || event.metaKey)) ||
            (event.key === 'p' && (event.ctrlKey || event.metaKey)) ||
            (event.key === 'f' && (event.ctrlKey || event.metaKey))
        ) {
            if (document.activeElement === this.searchInput) return;

            event.preventDefault();
            this.toggle();
        }
    }

    onSearch(event) {
        const results = this.fuse.search(event.target.value, { limit: 10 });

        this.searchResults.innerHTML = '';

        if (results.length === 0) {
            this.searchResults.innerHTML = '<p>No results found</p>';
            return;
        }

        let resultListHTML = '';
        results.forEach((result) => {
            const page = result.item;
            const searchResult = `
            <div class="searchResultItem" data-pageId="${page.id}" tabindex="0">
                <h3>${page.title}</h3>
                <p>${page.textContent.substring(0, 150)}</p>
            </div>
        `;

            resultListHTML += searchResult;
        });
        this.searchResults.innerHTML = resultListHTML;

        const searchResultItems =
            document.querySelectorAll('.searchResultItem');
        searchResultItems.forEach((item) => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-pageId');
                navigateTo(pageId);
                this.close();
            });

            item.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    item.click();
                }
            });
        });
    }

    onClose() {
        this.searchInput.value = '';
        document.getElementById('searchResults').innerHTML = '';
    }

    toggle() {
        if (this.modal.open) this.close();
        else this.open();
    }

    open() {
        this.modal.showModal();
    }
    close() {
        this.modal.close();
    }
}

const searchModal = new SearchModal();

const section = document.getElementById('list');
const loadAnimation = () => {
    section.innerHTML = `<div><img id="load" src="./assets/loading.gif" alt="loading..."></div>`;
}
const getDataLists = async () => {
    const rawDataMainList = await fetch('https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=hksRlq4zXFu3Itqjruc8igFoj22s4ZRR');
    const dataMainList = await rawDataMainList.json();
    return dataMainList.results;
}
const createMainList = async () => {
    window.scrollTo(0, 0);
    loadAnimation();
    const listsArray = await getDataLists();
    section.innerHTML = '<h1>BESTSELLERS</h1>';
    listsArray.forEach((list,i) => {
        const cardDiv = document.createElement('div')
        cardDiv.innerHTML =`<h2>${list.display_name}</h2><p>Oldest book: ${list.oldest_published_date}</p><p>Newest book: ${list.newest_published_date}</p><p>Updated: ${list.updated}</p><button id="button${i}"type="button">BRING ME IN!</button>`
        section.appendChild(cardDiv);
        document.getElementById(`button${i}`).addEventListener('click', ()=> createBooksList(list.list_name_encoded));
    });
}
const getDataBooks = async (code) => {
    const rawDataBooks = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${code}.json?api-key=hksRlq4zXFu3Itqjruc8igFoj22s4ZRR`)
    const dataBooks = await rawDataBooks.json();
    return dataBooks.results;
}
const createBooksList = async (code) => {
    window.scrollTo(0, 0);
    loadAnimation();
    const booksList = await getDataBooks(code);
    section.innerHTML = `<h1>${booksList.list_name}</h1><button id="back-button" type="button">&#60 BRING ME BACK!</button>`;
    booksList['books'].forEach(book => {
        const cardDiv = document.createElement('div');
        cardDiv.innerHTML = `<h2>#${book.rank} ${book.title}</h2><img src="${book.book_image}" alt="book cover"><p>Weeks on list: ${book.weeks_on_list}</p><p>${book.description}</p><a href="${book.amazon_product_url}" target="_blank"><button>BUY!</button></a>`
        section.appendChild(cardDiv)
    })
    document.getElementById('back-button').onclick = createMainList;
}
createMainList();
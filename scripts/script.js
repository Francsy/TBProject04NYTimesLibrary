//Función para animación mientras se cargan datos
const loadAnimation = () => {
    const animation = document.getElementById('list');
    animation.innerHTML = `<div><img id="load" src="./assets/loading.gif" alt="loading..."></div>`;
}
//Función que extrae lista principal y construye array con los datos necesarios
const getDataLists = async () => {
    const rawDataMainList = await fetch('https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=hksRlq4zXFu3Itqjruc8igFoj22s4ZRR');
    const dataMainList = await rawDataMainList.json();
    const mainListArray = dataMainList.results;
    return mainListArray;
}
//Función para pintar en el DOM la lista principal:
const createMainList = async () => {
    //función animación
    const listsArray = await getDataLists();
    const section = document.getElementById('list');
    section.innerHTML = '<h1>MAIN LIST</h1>';
    listsArray.forEach(list => {
        const cardDiv = document.createElement('div')
        cardDiv.innerHTML =`<h2>${list.display_name}</h2><p>Oldest book: ${list.oldest_published_date}</p><p>Newest book: ${list.newest_published_date}</p><p>Updated: ${list.updated}</p>`
        section.appendChild(cardDiv);
        const cardButton = document.createElement('button');
        cardButton.innerHTML = 'BRING ME IN!';
        cardButton.setAttribute('type', 'button');
        cardButton.addEventListener('click', ()=> createBooksList(list.list_name_encoded));
        section.appendChild(cardButton);
    });
}
//Función que extrae lista específica de libros y construye objeto necesario para pintar
const getDataBooks = async (code) => {
    const rawDataBooks = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${code}.json?api-key=hksRlq4zXFu3Itqjruc8igFoj22s4ZRR`)
    const dataBooks = await rawDataBooks.json();
    const booksList = dataBooks.results;
    return booksList; 
}
//Función que pinta en el DOM lista específica de libros
const createBooksList = async (code) => {
    //función animación
    const booksList = await getDataBooks(code);
    const section = document.getElementById('list');
    section.innerHTML = `<h1>${booksList.list_name}</h1><button id="back-button" type="button">&#60 BRING ME BACK!</button>`;
    booksList['books'].forEach(book => {
        const cardDiv = document.createElement('div');
        cardDiv.innerHTML = `<h2>#${book.rank} ${book.title}</h2><img src="${book.book_image}" alt="book cover"><p>Weeks on list: ${book.weeks_on_list}</p><p>${book.description}</p><a href="${book.amazon_product_url}" target="_blank"><button>BUY!</button></a>`
        section.appendChild(cardDiv)
    })
    const backButton = document.getElementById('back-button');
    backButton.onclick = createMainList;
}


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
        // cardButton.onclick = //funcion list.list_name_encoded
        section.appendChild(cardButton);
    });
}

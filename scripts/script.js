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

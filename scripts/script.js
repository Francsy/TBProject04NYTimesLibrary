//Firebase:
const firebaseConfig = {
    apiKey: "AIzaSyAfcU0w73LZE-R19NnH_vxNiiWLjGcSWvk",
    authDomain: "nyt-library-82f86.firebaseapp.com",
    projectId: "nyt-library-82f86",
    storageBucket: "nyt-library-82f86.appspot.com",
    messagingSenderId: "950393658023",
    appId: "1:950393658023:web:065726245adb7871f3d982"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const section = document.getElementById('list');

//Listener para saber que usuario está logeado:
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log(`Está en el sistema:${user.email} ${user.uid}`);
        getProfileImg(firebase.auth().currentUser.uid)
    } else {
        console.log("No hay usuarios en el sistema");
    }
})

//Función para logearse:
const loginUser = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((credential) => {
            let user = credential.user;
            Toastify({ text: `Está en el sistema: ${user.email}`, duration: 4000, style: { background: "#77AEBB", color: 'black', fontsize: '100px', }, position: 'left', close: true }).showToast();
            console.log(`${user.email} está en el sistema (ID: ${user.uid})`)
            console.log('USER', user)
        })
        .catch((error) => {
            console.log(error.code);
            console.log(error.message);
            Toastify({ text: error.message, duration: 4000, style: { background: "red", color: 'black', }, position: 'left', close: true }).showToast();
        })
}

//Función para deslogearse:
const logOut = () => {
    let user = firebase.auth().currentUser;
    firebase.auth().signOut()
        .then(() => {
            Toastify({ text: `See you soon ${user.email}!!!`, duration: 4000, style: { background: "#77AEBB", color: 'black', }, position: 'left', close: true }).showToast();
            console.log(user.mail + 'is out')
        })
        .catch((error) => {
            console.log('Error: ' + error)
        });
    setTimeout(() => location.reload(), 2000)

}

//Función que crea nuevo usuario:
const createUser = (email, password, file) => {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((credential) => {
            let user = credential.user;
            console.log(`${user.email} registrado con ID: ${user.uid}`)
            Toastify({ text: `registrado ${user.email} con ID ${user.uid}`, duration: 4000, style: { background: "#77AEBB", color: 'black', fontsize: '100px', }, position: 'left', close: true }).showToast();
            db.collection('users')
                .add({
                    id: user.uid,
                    email: user.email,
                    profile: file.name,
                    favs: []
                })
                .then((userDoc) => console.log(`New user document with ID: ${user.uid}`))
                .catch((error) => {
                    console.error("Error adding document: ", error);
                    Toastify({ text: `Error adding document: ${error}`, duration: 4000, style: { background: "red", color: 'black', fontsize: '100px', }, position: 'left', close: true }).showToast();
                }
                )
        })
        .catch((error) => {
            console.log("Error" + error.message)
        });
    firebase.storage().ref().child(`${email}-${file.name}`).put(file)
}

// Función para añadir favorito a firebase collection
const addFav = (userID, bookObject) => {
    db.collection('users')
        .where('id', '==', userID)
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                if (!doc.data().hasOwnProperty('favs')) {
                    doc.ref.update({ favs: [bookObject] })
                } else {
                    let arrfavs = doc.data().favs;
                    if (arrfavs.some(item => item.title === bookObject.title)) {
                        Toastify({ text: 'This book is already in your favourite list', duration: 4000, style: { background: "red", color: 'black', fontsize: '100px', }, position: 'left', close: true }).showToast()
                    } else {
                        doc.ref.update({ favs: arrfavs.concat(bookObject) });
                    }
                }
            });
        });
}

/* Funciones pintado de listas: */

const loadAnimation = () => section.innerHTML = `<div id="load"><img src="./assets/loading.gif" alt="loading..."></div>`;
const getDataLists = async () => {
    const rawDataMainList = await fetch('https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=hksRlq4zXFu3Itqjruc8igFoj22s4ZRR');
    const dataMainList = await rawDataMainList.json();
    return dataMainList.results;
}

const createMainList = async () => {
    window.scrollTo(0, 0);
    loadAnimation();
    const listsArray = await getDataLists();
    section.innerHTML = '<h1>BESTSELLERS</h1><section class="listsection"></section>';

    listsArray.forEach((list, i) => document.querySelector('.listsection').innerHTML += `<div class="listdiv"><h2>${list.display_name}</h2><p>Oldest book: ${list.oldest_published_date}</p><p>Newest book: ${list.newest_published_date}</p><p>Updated: ${list.updated}</p><button id="button${i}"type="button">BRING ME IN!</button></div>`);
    listsArray.forEach((list, i) => document.getElementById(`button${i}`).addEventListener('click', () => createBooksList(list.list_name_encoded)));
}

const getDataBooks = async (code) => {
    const rawDataBooks = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${code}.json?api-key=hksRlq4zXFu3Itqjruc8igFoj22s4ZRR`)
    const dataBooks = await rawDataBooks.json();
    return dataBooks.results;
}

const createBooksList = async (listCode) => {
    window.scrollTo(0, 0);
    loadAnimation();
    const booksList = await getDataBooks(listCode);
    section.innerHTML = `<h1>${booksList.list_name}</h1><button id="back-button" type="button">&#60 BRING ME BACK!</button><section class="listsection"></section>`;
    booksList['books'].forEach((book, i) => document.querySelector('.listsection').innerHTML += `<div class="bookdiv"><h2>#${book.rank} ${book.title}</h2><img src="${book.book_image}" alt="book cover"><p>Weeks on list: ${book.weeks_on_list}</p><p>${book.description}</p><div class="books-buttons"><a href="${book.amazon_product_url}" target="_blank"><button>BUY!</button></a><button class="favbuttons" id="fav${i}">&#9733;</button></div></div>`)
    document.getElementById('back-button').onclick = createMainList;
    booksList['books'].forEach((book, i) => document.getElementById(`fav${i}`).addEventListener('click', () => {
        let bookDetails = { amazon: book.amazon_product_url, description: book.description, image: book.book_image, title: book.title };
        addFav(firebase.auth().currentUser.uid, bookDetails);
    }))
    booksList['books'].forEach((book, i) => firebase.auth().onAuthStateChanged((user) => !user ? document.getElementById(`fav${i}`).style.display = 'none' : document.getElementById(`fav${i}`).style.display = 'inline'))
}

const createFavList = (userID) => {
    window.scrollTo(0, 0);
    loadAnimation();
    section.innerHTML = `<h1>YOUR FAVOURITE BOOKS</h1><button id="backf-button" type="button">&#60 BRING ME BACK!</button><section class="listsection"></section>`;
    db.collection('users')
        .where('id', '==', userID)
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                if (doc.data().favs[0]) {
                    doc.data().favs.forEach((fav, i) => {
                        document.querySelector('.listsection').innerHTML += `<div class="favdiv"><h2>#${i + 1} ${fav.title}</h2><img src="${fav.image}" alt="book cover"><p>${fav.description}</p><div class="books-buttons"><a href="${fav.amazon}" target="_blank"><button>BUY!</button></a><button id="rmv${i}">&#128465;</button></div></div>`

                    });
                    doc.data().favs.forEach((fav, i) => {
                        document.getElementById(`rmv${i}`).addEventListener('click', () => {
                            db.collection('users').doc(doc.id).update({ favs: firebase.firestore.FieldValue.arrayRemove(doc.data().favs[i]) });
                            console.log(`${i + 1} was deleted`)
                            Toastify({ text: `You removed the ${i + 1} book!`, duration: 4000, style: { background: "#77AEBB", color: 'black', fontsize: '100px', }, position: 'left', close: true }).showToast();
                            setTimeout(() => createFavList(firebase.auth().currentUser.uid), 500)
                        })
                    })
                } else {
                    section.innerHTML += "<h2>You have to add at least one book to your list</h2>"
                    Toastify({ text: 'Start adding some books to your personal list!!', duration: 4000, style: { background: "#77AEBB", color: 'black', fontsize: '100px', }, position: 'left', close: true }).showToast();
                }

            });
            document.getElementById('backf-button').onclick = createMainList;
        });
}

// Función para sacar la imagen de perfil:
const getProfileImg = (userID) => {
    db.collection('users')
        .where('id', '==', userID)
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                let email = doc.data().email
                let imgUrl = doc.data().profile
                firebase.storage().ref().child(`${email}-${imgUrl}`)
                    .getDownloadURL()
                    .then(function (url) {
                        document.querySelector(".profileimg").innerHTML = `<img src="${url}">`
                    })
                    .catch(function (error) {
                        console.log("error encountered with the profile img");
                    });
            });
        });
}

/* ----------------------- Código que controla lo que pasa en cada página  ----------------------- */

if (document.title === 'NYT Library') {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            document.getElementById('authaccess').innerHTML = `<button class="getout">Log out</button>`
            document.querySelector('.getout').onclick = logOut;
            document.getElementById('favlist').style.display = "block";
        }
    });
    createMainList();
    document.getElementById('favlist').addEventListener('click', () => createFavList(firebase.auth().currentUser.uid))
}

if (document.title === 'Login') {
    document.getElementById("formlog").addEventListener("submit", function (event) {
        event.preventDefault();
        let mail = event.target.elements.logemail.value;
        let pass = event.target.elements.logpassword.value;
        loginUser(mail, pass)
    })
    const openButton = document.getElementById('openregistration');
    const registration = document.getElementById('register');
    openButton.onclick = () => registration.style.display === 'block' ? registration.style.display = 'none' : registration.style.display = 'block'
    document.getElementById('formreg').addEventListener('submit', (event) => {
        event.preventDefault();
        let mail = event.target.elements.email.value;
        let password = event.target.elements.password1.value;
        let checkPass = event.target.elements.password2.value;
        let file = event.target.elements.file.files[0];
        let newName = file['name'].split(' ').join('-');
        let fileMod = new File([file], newName);
        password === checkPass ? createUser(mail, password, fileMod) : Toastify({ text: "Error: you put differents passwords", duration: 4000, style: { background: "#77AEBB", color: 'black', fontsize: '100px', }, position: 'left', close: true }).showToast();
    })
    document.getElementById('outdiv').innerHTML = `<button class="getout">Log out</button>`;
    document.querySelector('.getout').onclick = logOut;

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            openButton.style.display = 'none';
            document.querySelector('.getout').style.display = 'inline';
        } else {
            document.querySelector('.getout').style.display = 'none';
        }
    });
}
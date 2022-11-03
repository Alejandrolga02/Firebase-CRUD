'use strict';
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, onValue, ref, set, child, get, update, remove } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

const firebaseConfig = {
	apiKey: "AIzaSyDDG__NXwuBiuiJimbogM-FJOQVl2nJhlc",
	authDomain: "alejandrolga-webfinal.firebaseapp.com",
	projectId: "alejandrolga-webfinal",
	storageBucket: "alejandrolga-webfinal.appspot.com",
	messagingSenderId: "527030299000",
	appId: "1:527030299000:web:a1c1c54973bf2a9211008d",
	measurementId: "G-13ZX3GTW9G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

// Declarar elementos del DOM
const btnAgregar = document.querySelector("#btnAgregar");
const btnConsultar = document.querySelector("#btnConsultar");
const btnActualizar = document.querySelector("#btnActualizar");
const btnEliminar = document.querySelector("#btnEliminar");
const btnMostrar = document.querySelector("#btnMostrar");
const btnLimpiar = document.querySelector("#btnLimpiar");
const lista = document.querySelector("#lista");

// Variables input
const getInputs = () => {
	event.preventDefault();

	return {
		matricula: (document.querySelector("#matricula").value).trim(),
		nombre: (document.querySelector("#nombre").value).trim(),
		carrera: (document.querySelector("#carrera").value).trim(),
		genero: (document.querySelector("#genero").value).trim()
	}
};

const clearInputs = () => {
	event.preventDefault();
	document.querySelector("#matricula").value = "";
	document.querySelector("#nombre").value = "";
	document.querySelector("#carrera").value = "";
	document.querySelector("#genero").value = "0";
	lista.innerHTML = "";
	lista.classList.add("none");
}

const insertData = () => {
	let { matricula, nombre, carrera, genero } = getInputs();

	if (matricula === "" || nombre === "" || carrera === "" || genero === "") return alert("Existen campos vacios");

	set(ref(db, 'alumnos/' + matricula), {
		nombre: nombre,
		carrera: carrera,
		genero: genero
	}).then(() => {
		alert("Se insertaron con exito los datos");
	}).catch((error) => {
		alert("Surgio un error: " + error);
	});
};

const fillInputs = ({ nombre, carrera, genero }) => {
	document.querySelector("#nombre").value = nombre;
	document.querySelector("#carrera").value = carrera;
	document.querySelector("#genero").value = genero;
}

const showData = () => {
	let { matricula } = getInputs();

	if (matricula === "") return alert("Introduzca una matricula");

	const dbref = ref(db);
	get(child(dbref, 'alumnos/' + matricula)).then((snapshot) => {
		if (snapshot.exists()) {
			let nombre = snapshot.val().nombre;
			let carrera = snapshot.val().carrera;
			let genero = snapshot.val().genero;
			fillInputs({ nombre, carrera, genero });
		} else {
			alert("No se encontró el registro")
		}
	}).catch((error) => {
		alert("Surgio un error: " + error);
	})
};

const showStudents = () => {
	const dbref = ref(db, 'alumnos');

	onValue(dbref, (snapshot) => {
		lista.innerHTML = `<div class="renglon">
			<div class="campo bold">Matricula</div>
			<div class="campo bold">Nombre</div>
			<div class="campo bold">Carrera</div>
			<div class="campo bold">Genero</div>
		</div>`;

		snapshot.forEach((childSnapshot) => {
			const childKey = childSnapshot.key;
			const childData = childSnapshot.val();
			lista.innerHTML += `<div class="renglon">
				<div class="campo">${childKey}</div>
				<div class="campo">${childData.nombre}</div>
				<div class="campo">${childData.carrera}</div>
				<div class="campo">${childData.genero}</div>
			</div>`;
		});
	});

	lista.classList.remove('none');
}

const updateData = () => {
	let { matricula, nombre, carrera, genero } = getInputs();

	if (matricula === "" || nombre === "" || carrera === "" || genero === "") return alert("Existen campos vacios");

	update(ref(db, 'alumnos/' + matricula), {
		nombre: nombre,
		carrera: carrera,
		genero: genero
	}).then(() => {
		alert("Se realizó una actualización");
	}).catch((err) => {
		alert("Sucedió una excepción" + err);
	});
}

const deleteData = () => {
	let { matricula } = getInputs();

	if (matricula === "") return alert("Introduzca una matricula");

	remove(ref(db, 'alumnos/' + matricula))
		.then(() => {
			alert("Se eliminó un registro");
			showStudents();
		}).catch((err) => {
			alert("Sucedió una excepción" + err);
		});
}

btnAgregar.addEventListener('click', insertData);
btnConsultar.addEventListener('click', showData);
btnActualizar.addEventListener('click', updateData);
btnEliminar.addEventListener('click', deleteData);
btnMostrar.addEventListener('click', showStudents);
btnLimpiar.addEventListener('click', clearInputs);
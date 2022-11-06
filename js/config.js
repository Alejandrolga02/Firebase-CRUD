"use strict";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, onValue, ref, set, child, get, update, remove } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";
import {
	getStorage,
	deleteObject,
	ref as refStorage,
	uploadBytes,
	getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-storage.js";

const firebaseConfig = {
	apiKey: "AIzaSyDDG__NXwuBiuiJimbogM-FJOQVl2nJhlc",
	authDomain: "alejandrolga-webfinal.firebaseapp.com",
	projectId: "alejandrolga-webfinal",
	storageBucket: "alejandrolga-webfinal.appspot.com",
	messagingSenderId: "527030299000",
	appId: "1:527030299000:web:a1c1c54973bf2a9211008d",
	measurementId: "G-13ZX3GTW9G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage();

// Declarar elementos del DOM
const btnAgregar = document.querySelector("#btnAgregar");
const btnConsultar = document.querySelector("#btnConsultar");
const btnActualizar = document.querySelector("#btnActualizar");
const btnEliminar = document.querySelector("#btnEliminar");
const btnMostrar = document.querySelector("#btnMostrar");
const btnLimpiar = document.querySelector("#btnLimpiar");
const lista = document.querySelector("#lista");
const imagen = document.querySelector("#imagen");

// Variables input
const getInputs = () => {
	event.preventDefault();

	return {
		matricula: document.querySelector("#matricula").value.trim().toUpperCase(),
		nombre: document.querySelector("#nombre").value.trim(),
		carrera: document.querySelector("#carrera").value.trim(),
		genero: document.querySelector("#genero").value.trim(),
	};
};

const clearInputs = () => {
	event.preventDefault();
	document.querySelector("#matricula").value = "";
	document.querySelector("#nombre").value = "";
	document.querySelector("#carrera").value = "";
	document.querySelector("#genero").value = "0";
	lista.innerHTML = "";
	lista.classList.add("none");
	imagen.value = "";
	document.getElementById("imgPreview").classList.add("none");
	document.getElementById("imagenName").innerHTML = "No se han seleccionado archivos";
};

const fillInputs = ({ nombre, carrera, genero, url }) => {
	document.querySelector("#nombre").value = nombre;
	document.querySelector("#carrera").value = carrera;
	document.querySelector("#genero").value = genero;
	document.querySelector("#imgPreview").src = url;
	document.getElementById("imgPreview").classList.remove("none");
};

const imagenChange = () => {
	document.getElementById("imagenName").innerHTML = imagen.files[0].name;
	document.getElementById("imgPreview").src = URL.createObjectURL(imagen.files[0]);
	document.getElementById("imgPreview").classList.remove("none");
};

async function insertData() {
	try {
		let { matricula, nombre, carrera, genero } = getInputs();
		const dbref = ref(db);
		const storageRef = refStorage(storage, "alumnos/" + matricula);

		if (matricula === "" || nombre === "" || carrera === "" || genero === "" || imagen.value === "") return alert("Existen campos vacios");

		const snapshot = await get(child(dbref, "alumnos/" + matricula));
		if (snapshot.exists()) return alert("La matricula ya existe");

		await uploadBytes(storageRef, imagen.files[0]);
		let url = await getDownloadURL(storageRef);

		await set(ref(db, "alumnos/" + matricula), {
			nombre: nombre,
			carrera: carrera,
			genero: genero,
			url: url,
		});

		alert("Se insertaron con exito los datos");
	} catch (error) {
		console.log(error);
	}
}

async function showData() {
	try {
		let { matricula } = getInputs();
		if (matricula === "") return alert("Introduzca una matricula");

		const dbref = ref(db);
		const snapshot = await get(child(dbref, "alumnos/" + matricula));

		if (snapshot.exists()) {
			let nombre = snapshot.val().nombre;
			let carrera = snapshot.val().carrera;
			let genero = snapshot.val().genero;
			let url = snapshot.val().url;
			if (!url) {
				const storageRef = refStorage(storage, "imagenVacia.svg");
				url = await getDownloadURL(storageRef);
			}
			fillInputs({ nombre, carrera, genero, url });
		} else {
			alert("No se encontró el registro");
		}
	} catch (error) {
		console.log(error);
	}
}

async function showStudents() {
	try {
		const dbref = ref(db, "alumnos");

		const storageRef = refStorage(storage, "imagenVacia.svg");
		let urlDefault = await getDownloadURL(storageRef);

		await onValue(dbref, snapshot => {
			lista.innerHTML = `<div class="renglon">
				<div class="campo bold">Matricula</div>
				<div class="campo bold">Nombre</div>
				<div class="campo bold">Carrera</div>
				<div class="campo bold">Genero</div>
				<div class="campo bold">Imagen</div>
			</div>`;

			snapshot.forEach(childSnapshot => {
				const childKey = childSnapshot.key;
				const childData = childSnapshot.val();
				let imgURL;
				if (childData.url === undefined) {
					imgURL = urlDefault;
				} else {
					imgURL = childData.url;
				}
				lista.innerHTML += `<div class="renglon">
					<div class="campo">${childKey}</div>
					<div class="campo">${childData.nombre}</div>
					<div class="campo">${childData.carrera}</div>
					<div class="campo">${childData.genero}</div>
					<div class="campo"><img class="campo-img" src="${imgURL}" alt="Imagen de ${childData.nombre}"/></div>
				</div>`;
			});
		});

		lista.classList.remove("none");
	} catch (error) {
		console.log(error);
	}
}

async function updateData() {
	try {
		let { matricula, nombre, carrera, genero } = getInputs();
		const storageRef = refStorage(storage, "alumnos/" + matricula);

		if (matricula === "" || nombre === "" || carrera === "" || genero === "" || imagen.value === "") return alert("Existen campos vacios");

		await uploadBytes(storageRef, imagen.files[0]);
		let url = await getDownloadURL(storageRef);

		await update(ref(db, "alumnos/" + matricula), {
			nombre: nombre,
			carrera: carrera,
			genero: genero,
			url: url,
		});

		alert("Se realizó una actualización");
	} catch (error) {
		console.log(error);
	}
}

async function deleteData() {
	try {
		let { matricula } = getInputs();

		if (matricula === "") return alert("Introduzca una matricula");

		// Create a reference to the file to delete
		const imageDelete = refStorage(storage, matricula);

		// Delete the file
		await deleteObject(imageDelete);

		await remove(ref(db, "alumnos/" + matricula));
		alert("Se eliminó un registro");
		await showStudents();
	} catch (error) {
		console.log(error);
	}
}

btnAgregar.addEventListener("click", insertData);
btnConsultar.addEventListener("click", showData);
btnActualizar.addEventListener("click", updateData);
btnEliminar.addEventListener("click", deleteData);
btnMostrar.addEventListener("click", showStudents);
btnLimpiar.addEventListener("click", clearInputs);
imagen.addEventListener("change", imagenChange);

// script.js
document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM - Formularios
    const formTarea = document.getElementById("formTarea");
    const inputIdTarea = document.getElementById("idTarea");
    const inputNombre = document.getElementById("nombre");
    const selectCategoria = document.getElementById("categoria");
    const inputFecha = document.getElementById("fecha");
    const textareaComentarios = document.getElementById("comentarios");
    const btnSubmitForm = document.getElementById("btnSubmitForm");
    const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");

    // Elementos del DOM - Navegación y Secciones
    const navLinks = document.querySelectorAll(".nav-link");
    const pageSections = document.querySelectorAll(".page-section");

    // Elementos del DOM - Tema
    const btnCambiarTema = document.getElementById("btnCambiarTema");
    const htmlElement = document.documentElement;

    // Elementos del DOM - Lista de Tareas
    const tareasListaUL = document.getElementById("tareasListaUL");
    const filtroCategoriaListaSelect = document.getElementById("filtroCategoriaLista");
    const ordenarPorFechaSelect = document.getElementById("ordenarPorFecha");

    // Elementos del DOM - Calendario
    const calendarioGrid = document.getElementById("calendarioGrid");
    const mesAnoActualEl = document.getElementById("mesAnoActual");
    const prevMesBtn = document.getElementById("prevMes");
    const nextMesBtn = document.getElementById("nextMes");
    const filtroCategoriaCalendarioSelect = document.getElementById("filtroCategoriaCalendario");

    // Elementos del DOM - Footer y Toasts
    const currentYearSpan = document.getElementById("currentYear");
    const toastContainer = document.getElementById("toastContainer");

    // --- Estado de la Aplicación ---
    let tareas = JSON.parse(localStorage.getItem("tareasHuertaUrbanaV2")) || [];
    let editandoId = null;
    let fechaCalendarioActual = new Date();
    let filtroCategoriaCalendarioActual = "todas";
    let filtroCategoriaListaActual = "todas";
    let ordenListaActual = "desc";

    // --- Inicialización del Año en Footer ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Lógica de Navegación SPA ---
    function mostrarSeccion(idSeccionTarget) {
        let idSeccionReal = idSeccionTarget;
        // Si el id no existe, mostrar dashboard
        if (!document.getElementById(idSeccionTarget)) {
            idSeccionReal = "dashboard";
        }

        pageSections.forEach(section => {
            section.classList.toggle("active-section", section.id === idSeccionReal);
        });
        navLinks.forEach(link => {
            link.classList.toggle("active-nav-link", link.hash === `#${idSeccionReal}` && link.closest('header nav, .dashboard-quick-links'));
        });
        
        // Actualizar hash solo si es diferente y la sección es válida
        if (window.location.hash !== `#${idSeccionReal}`) {
             window.location.hash = idSeccionReal;
        }
       
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.hash.substring(1);
            mostrarSeccion(targetId);
        });
    });

    const hashInicial = window.location.hash.substring(1);
    mostrarSeccion(hashInicial || "dashboard"); // Si no hay hash, o el hash no es válido, va a dashboard

    window.addEventListener('hashchange', () => {
        const nuevoHash = window.location.hash.substring(1);
        mostrarSeccion(nuevoHash || "dashboard");
    });


    // --- Lógica de Temas ---
    function aplicarTema(tema) {
        htmlElement.setAttribute("data-tema", tema);
        localStorage.setItem("temaHuertaPreferidoV2", tema);
        btnCambiarTema.innerHTML = tema === "oscuro" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    const temaGuardado = localStorage.getItem("temaHuertaPreferidoV2");
    const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    aplicarTema(temaGuardado || (prefiereOscuro ? "oscuro" : "claro"));

    btnCambiarTema.addEventListener("click", () => {
        const temaActual = htmlElement.getAttribute("data-tema");
        aplicarTema(temaActual === "claro" ? "oscuro" : "claro");
    });

    // --- Gestión de Toasts/Snackbars ---
    function showToast(message, type = "info", duration = 3000) {
        const toast = document.createElement("div");
        toast.classList.add("toast", type);
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    // --- Funciones de Validación de Formulario ---
    function mostrarError(inputElement, mensaje) {
        const errorElementId = inputElement.getAttribute("aria-describedby");
        if (errorElementId) {
            const errorElement = document.getElementById(errorElementId);
            if(errorElement){
                errorElement.textContent = mensaje;
                errorElement.classList.add("visible");
            }
        }
        inputElement.classList.add("invalid");
    }

    function limpiarError(inputElement) {
        const errorElementId = inputElement.getAttribute("aria-describedby");
        if (errorElementId) {
            const errorElement = document.getElementById(errorElementId);
            if(errorElement) {
                errorElement.textContent = "";
                errorElement.classList.remove("visible");
            }
        }
        inputElement.classList.remove("invalid");
    }
    
    function limpiarTodosLosErrores() {
        [inputNombre, selectCategoria, inputFecha, textareaComentarios].forEach(el => {
            if(el) limpiarError(el); // Comprobar si el elemento existe
        });
    }

    function validarFormulario() {
        let esValido = true;
        limpiarTodosLosErrores(); 

        if (inputNombre.value.trim() === "") {
            mostrarError(inputNombre, "El nombre es obligatorio.");
            esValido = false;
        } else if (inputNombre.value.trim().length < 3) {
            mostrarError(inputNombre, "El nombre debe tener al menos 3 caracteres.");
            esValido = false;
        }

        if (selectCategoria.value === "") {
            mostrarError(selectCategoria, "Debes seleccionar una categoría.");
            esValido = false;
        }

        if (inputFecha.value === "") {
            mostrarError(inputFecha, "La fecha es obligatoria.");
            esValido = false;
        }
        
        if (textareaComentarios.value.trim().length > 300) {
            mostrarError(textareaComentarios, "Los comentarios no deben exceder los 300 caracteres.");
            esValido = false;
        }

        btnSubmitForm.disabled = !esValido;
        return esValido;
    }
    
    [inputNombre, textareaComentarios].forEach(el => el.addEventListener('input', () => {
        limpiarError(el);
        validarFormulario();
    }));
    [selectCategoria, inputFecha].forEach(el => el.addEventListener('change', () => {
        limpiarError(el);
        validarFormulario();
    }));


    // --- Gestión de Tareas (CRUD) ---
    function guardarTareas() {
        localStorage.setItem("tareasHuertaUrbanaV2", JSON.stringify(tareas));
    }

    function renderizarTareasLista() {
        tareasListaUL.innerHTML = "";
        let tareasFiltradasYOrdenadas = [...tareas];

        if (filtroCategoriaListaActual !== "todas") {
            tareasFiltradasYOrdenadas = tareasFiltradasYOrdenadas.filter(t => t.categoria === filtroCategoriaListaActual);
        }
        tareasFiltradasYOrdenadas.sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            return ordenListaActual === "asc" ? fechaA - fechaB : fechaB - fechaA;
        });

        if (tareasFiltradasYOrdenadas.length === 0) {
            const liVacio = document.createElement("li");
            liVacio.textContent = "No hay tareas registradas que coincidan con los filtros.";
            liVacio.style.textAlign = "center";
            liVacio.style.padding = "2rem";
            liVacio.style.borderLeftColor = "transparent"; // Evitar borde de color
            tareasListaUL.appendChild(liVacio);
            return;
        }

        tareasFiltradasYOrdenadas.forEach(tarea => {
            const li = document.createElement("li");
            const categoriaClass = tarea.categoria.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
            const coloresCategorias = {
                "siembra": "#4CAF50", "riego": "#2196F3", "cosecha": "#FF9800",
                "fertilizacion": "#9C27B0", "poda": "#795548", "tratamiento": "#F44336",
                "mantenimiento": "#607D8B", "otro": "#FFC107"
            };
            li.style.borderLeft = `5px solid ${coloresCategorias[categoriaClass] || 'var(--color-accent)'}`;

            let comentariosHTML = "";
            if (tarea.comentarios && tarea.comentarios.trim() !== "") {
                comentariosHTML = `<p class="task-comentarios"><strong>Comentarios:</strong> ${tarea.comentarios.replace(/\n/g, '<br>')}</p>`;
            }
            
            const fechaTarea = new Date(tarea.fecha); // La fecha ya está como YYYY-MM-DD
            const fechaFormateada = new Date(fechaTarea.getUTCFullYear(), fechaTarea.getUTCMonth(), fechaTarea.getUTCDate()).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            li.innerHTML = `
                <strong>${tarea.nombre}</strong>
                <div class="task-meta">
                    <span>Categoría: <strong>${tarea.categoria}</strong></span>
                    <span>Fecha: <strong>${fechaFormateada}</strong></span>
                </div>
                ${comentariosHTML}
                <div class="task-actions">
                    <button class="btn-editar" data-id="${tarea.id}" title="Editar tarea"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn-eliminar" data-id="${tarea.id}" title="Eliminar tarea"><i class="fas fa-trash-alt"></i> Eliminar</button>
                </div>
            `;
            li.querySelector(".btn-editar").addEventListener("click", () => cargarTareaParaEditar(tarea.id));
            li.querySelector(".btn-eliminar").addEventListener("click", () => eliminarTarea(tarea.id));
            tareasListaUL.appendChild(li);
        });
    }

    filtroCategoriaListaSelect.addEventListener("change", (e) => {
        filtroCategoriaListaActual = e.target.value;
        renderizarTareasLista();
    });
    ordenarPorFechaSelect.addEventListener("change", (e) => {
        ordenListaActual = e.target.value;
        renderizarTareasLista();
    });

    formTarea.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validarFormulario()) {
            showToast("Por favor, corrige los errores en el formulario.", "error");
            const primerError = formTarea.querySelector('.invalid');
            if (primerError) primerError.focus();
            return;
        }

        const tareaData = {
            nombre: inputNombre.value.trim(),
            categoria: selectCategoria.value,
            fecha: inputFecha.value, // YYYY-MM-DD
            comentarios: textareaComentarios.value.trim()
        };

        let mensajeExito = "";
        if (editandoId) {
            const index = tareas.findIndex(t => t.id === editandoId);
            if (index > -1) {
                tareas[index] = { ...tareas[index], ...tareaData };
            }
            mensajeExito = "Tarea actualizada exitosamente.";
        } else {
            const nuevaTarea = { id: Date.now(), ...tareaData };
            tareas.push(nuevaTarea);
            mensajeExito = "Tarea agregada exitosamente.";
        }

        guardarTareas();
        renderizarTareasLista();
        renderizarCalendario();
        showToast(mensajeExito, "success");
        
        resetearFormulario();
        inputNombre.focus();
    });
    
    function resetearFormulario() {
        formTarea.reset();
        editandoId = null;
        btnSubmitForm.textContent = "Agregar Tarea";
        btnSubmitForm.disabled = true;
        btnCancelarEdicion.classList.add("hidden");
        limpiarTodosLosErrores();
    }

    btnCancelarEdicion.addEventListener("click", () => {
        resetearFormulario();
        inputNombre.focus();
    });

    function cargarTareaParaEditar(id) {
        const tarea = tareas.find(t => t.id === id);
        if (!tarea) return;

        editandoId = tarea.id;
        inputNombre.value = tarea.nombre;
        selectCategoria.value = tarea.categoria;
        inputFecha.value = tarea.fecha; // El input date espera YYYY-MM-DD
        textareaComentarios.value = tarea.comentarios || "";

        btnSubmitForm.textContent = "Actualizar Tarea";
        btnSubmitForm.disabled = false;
        btnCancelarEdicion.classList.remove("hidden");
        limpiarTodosLosErrores();
        mostrarSeccion("formulario");
        inputNombre.focus();
    }

    function eliminarTarea(id) {
        if (confirm("¿Estás seguro de eliminar esta tarea? Esta acción no se puede deshacer.")) {
            tareas = tareas.filter(t => t.id !== id);
            guardarTareas();
            renderizarTareasLista();
            renderizarCalendario();
            showToast("Tarea eliminada.", "info");
            if (editandoId === id) resetearFormulario();
        }
    }

    // --- Lógica del Calendario ---
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    function renderizarCalendario() {
        calendarioGrid.innerHTML = "";
        const primerDiaDelMes = new Date(fechaCalendarioActual.getFullYear(), fechaCalendarioActual.getMonth(), 1);
        const ultimoDiaDelMes = new Date(fechaCalendarioActual.getFullYear(), fechaCalendarioActual.getMonth() + 1, 0);
        mesAnoActualEl.textContent = fechaCalendarioActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());

        diasSemana.forEach(dia => {
            const diaHeaderEl = document.createElement("div");
            diaHeaderEl.classList.add("calendario-dia-header");
            diaHeaderEl.textContent = dia;
            calendarioGrid.appendChild(diaHeaderEl);
        });

        for (let i = 0; i < primerDiaDelMes.getDay(); i++) { // getDay() es 0 para Domingo, 1 para Lunes...
            const diaVacioEl = document.createElement("div");
            diaVacioEl.classList.add("calendario-dia", "otro-mes");
            calendarioGrid.appendChild(diaVacioEl);
        }

        for (let i = 1; i <= ultimoDiaDelMes.getDate(); i++) {
            const diaEl = document.createElement("div");
            diaEl.classList.add("calendario-dia");
            const fechaIteracion = new Date(fechaCalendarioActual.getFullYear(), fechaCalendarioActual.getMonth(), i);

            const diaNumeroEl = document.createElement("span");
            diaNumeroEl.classList.add("dia-numero");
            diaNumeroEl.textContent = i;
            diaEl.appendChild(diaNumeroEl);

            const hoy = new Date();
            if (fechaIteracion.toDateString() === hoy.toDateString()) {
                diaEl.classList.add("hoy");
            }

            const tareasDelDiaDiv = document.createElement("div");
            tareasDelDiaDiv.classList.add("tareas-del-dia");
            const tareasParaEsteDia = tareas.filter(tarea => {
                // Comparamos fechas como YYYY-MM-DD para evitar problemas de zona horaria/hora
                const fechaTareaObjeto = new Date(tarea.fecha + "T00:00:00"); // Asegurar que es medianoche local
                return fechaTareaObjeto.getFullYear() === fechaIteracion.getFullYear() &&
                       fechaTareaObjeto.getMonth() === fechaIteracion.getMonth() &&
                       fechaTareaObjeto.getDate() === fechaIteracion.getDate() &&
                       (filtroCategoriaCalendarioActual === "todas" || tarea.categoria === filtroCategoriaCalendarioActual);
            });

            tareasParaEsteDia.forEach(tarea => {
                const puntoTarea = document.createElement("span");
                const categoriaClass = tarea.categoria.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
                puntoTarea.classList.add("tarea-punto", categoriaClass);
                puntoTarea.title = `${tarea.nombre} (${tarea.categoria})`;
                tareasDelDiaDiv.appendChild(puntoTarea);
            });
            diaEl.appendChild(tareasDelDiaDiv);
            calendarioGrid.appendChild(diaEl);
        }
    }

    prevMesBtn.addEventListener("click", () => {
        fechaCalendarioActual.setMonth(fechaCalendarioActual.getMonth() - 1);
        renderizarCalendario();
    });
    nextMesBtn.addEventListener("click", () => {
        fechaCalendarioActual.setMonth(fechaCalendarioActual.getMonth() + 1);
        renderizarCalendario();
    });
    filtroCategoriaCalendarioSelect.addEventListener("change", (e) => {
        filtroCategoriaCalendarioActual = e.target.value;
        renderizarCalendario();
    });

    // --- Inicialización General ---
    renderizarTareasLista();
    renderizarCalendario();
    btnSubmitForm.disabled = true; 
});
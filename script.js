document.addEventListener("DOMContentLoaded", () => {

    const seccionDashboard = document.getElementById("dashboard");
    const seccionFormulario = document.getElementById("formulario-seccion");
    const seccionLista = document.getElementById("lista-seccion");

    const btnDashboard = document.getElementById("btnDashboard");
    const btnFormulario = document.getElementById("btnFormulario");
    const btnLista = document.getElementById("btnLista");

    const formTarea = document.getElementById("formTarea");
    const inputIdTarea = document.getElementById("idTarea");
    const inputNombre = document.getElementById("nombre");
    const selectCategoria = document.getElementById("categoria");
    const inputFecha = document.getElementById("fecha");
    const textareaComentarios = document.getElementById("comentarios");
    const btnSubmitForm = document.getElementById("btnSubmitForm");
    const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
    const formFeedback = document.getElementById("form-feedback");

    const tareasListaUL = document.getElementById("tareasListaUL");
    const filtroCategoriaListaSelect = document.getElementById("filtroCategoriaLista");
    const ordenarPorFechaSelect = document.getElementById("ordenarPorFecha");

    const currentYearSpan = document.getElementById("currentYear");

    function mostrarSeccion(seccionAMostrar) {
        seccionDashboard.style.display = 'none';
        seccionFormulario.style.display = 'none';
        seccionLista.style.display = 'none';

        seccionAMostrar.style.display = 'block';
    }

    btnDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarSeccion(seccionDashboard);
    });

    btnFormulario.addEventListener('click', () => {
        resetearFormulario();
        mostrarSeccion(seccionFormulario);
    });

    btnLista.addEventListener('click', () => {
        mostrarSeccion(seccionLista);
        renderizarTareas();
    });

    const dashboardBackground = document.getElementById('dashboard-background');
    if (dashboardBackground) {
        const imagenes = ['img1.jpg', 'img2.png', 'img3.jpg', 'img4.webp'];
        let imagenActual = 0;

        function cambiarImagenFondo() {
            imagenActual = (imagenActual + 1) % imagenes.length;
            dashboardBackground.style.backgroundImage = `url('${imagenes[imagenActual]}')`;
        }
        cambiarImagenFondo();
        setInterval(cambiarImagenFondo, 5000);
    }

    // --- LÓGICA DE LA APP ---
    let tareas = JSON.parse(localStorage.getItem("tareasHuerta")) || [];

    function guardarTareas() {
        localStorage.setItem("tareasHuerta", JSON.stringify(tareas));
    }

    function mostrarFeedback(mensaje, tipo = 'success') {
        formFeedback.textContent = mensaje;
        formFeedback.className = tipo === 'success' ? 'feedback-success' : 'feedback-error';
        setTimeout(() => {
            formFeedback.textContent = '';
            formFeedback.className = '';
        }, 3000);
    }

    function renderizarTareas() {
        tareasListaUL.innerHTML = "";
        let tareasParaMostrar = [...tareas];

        const categoriaFiltro = filtroCategoriaListaSelect.value;
        if (categoriaFiltro !== "todas") {
            tareasParaMostrar = tareasParaMostrar.filter(tarea => tarea.categoria === categoriaFiltro);
        }

        const orden = ordenarPorFechaSelect.value;
        tareasParaMostrar.sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);

            if (orden === "desc") { 
                return fechaA - fechaB;
            } else {
                return fechaB - fechaA;
            }
        });

        if (tareasParaMostrar.length === 0) {
            tareasListaUL.innerHTML = "<li class='empty-list-message'>No hay tareas para mostrar. ¡Agrega una nueva!</li>";
            return;
        }

        tareasParaMostrar.forEach(tarea => {
            const li = document.createElement("li");
            li.setAttribute('data-categoria', tarea.categoria);
            const fechaCorrecta = new Date(tarea.fecha + 'T00:00:00');
            const fechaFormateada = fechaCorrecta.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            li.innerHTML = `
                <strong>${tarea.nombre}</strong>
                <div class="task-meta">
                    <span>Categoría: <strong>${tarea.categoria}</strong></span>
                    <span>Fecha: <strong>${fechaFormateada}</strong></span>
                </div>
                ${tarea.comentarios ? `<p class="task-comentarios">${tarea.comentarios}</p>` : ''}
                <div class="task-actions">
                    <button class="btn-editar" data-id="${tarea.id}">Editar</button>
                    <button class="btn-eliminar" data-id="${tarea.id}">Eliminar</button>
                </div>
            `;
            tareasListaUL.appendChild(li);
        });
    }

    function validarFormulario() {
        let esValido = true;
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        document.querySelectorAll('form input.invalid, form select.invalid').forEach(el => el.classList.remove('invalid'));

        if (inputNombre.value.trim().length < 3) {
            const errorSpan = document.getElementById('nombreError');
            errorSpan.textContent = 'El nombre debe tener al menos 3 caracteres.';
            errorSpan.style.display = 'block';
            inputNombre.classList.add('invalid');
            esValido = false;
        }
        if (selectCategoria.value === "") {
            const errorSpan = document.getElementById('categoriaError');
            errorSpan.textContent = 'Debes seleccionar una categoría.';
            errorSpan.style.display = 'block';
            selectCategoria.classList.add('invalid');
            esValido = false;
        }
        if (inputFecha.value === "") {
            const errorSpan = document.getElementById('fechaError');
            errorSpan.textContent = 'La fecha es obligatoria.';
            errorSpan.style.display = 'block';
            inputFecha.classList.add('invalid');
            esValido = false;
        }
        return esValido;
    }

    function resetearFormulario() {
        formTarea.reset();
        inputIdTarea.value = '';
        btnSubmitForm.textContent = "Guardar Tarea";
        btnCancelarEdicion.classList.add("hidden");
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        document.querySelectorAll('form input.invalid, form select.invalid').forEach(el => el.classList.remove('invalid'));
        formFeedback.textContent = '';
        formFeedback.className = '';
    }

    formTarea.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validarFormulario()) {
            mostrarFeedback("Por favor, corrige los errores.", 'error');
            return;
        }
        const id = inputIdTarea.value;
        const tareaData = {
            nombre: inputNombre.value.trim(),
            categoria: selectCategoria.value,
            fecha: inputFecha.value,
            comentarios: textareaComentarios.value.trim()
        };
        if (id) {
            const index = tareas.findIndex(t => t.id === parseInt(id));
            if (index > -1) {
                tareas[index] = {
                    ...tareas[index], ...tareaData,
                    id: parseInt(id)
                };
                mostrarFeedback("Tarea actualizada con éxito.", 'success');
            }
        } else {
            const nuevaTarea = {
                id: Date.now(), ...tareaData
            };
            tareas.push(nuevaTarea);
            mostrarFeedback("Tarea agregada con éxito.", 'success');
        }
        guardarTareas();
        resetearFormulario();
        mostrarSeccion(seccionLista);
        renderizarTareas();
    });

    tareasListaUL.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("btn-editar")) {
            const id = parseInt(target.dataset.id);
            const tareaAEditar = tareas.find(t => t.id === id);
            if (tareaAEditar) {
                inputIdTarea.value = tareaAEditar.id;
                inputNombre.value = tareaAEditar.nombre;
                selectCategoria.value = tareaAEditar.categoria;
                inputFecha.value = tareaAEditar.fecha;
                textareaComentarios.value = tareaAEditar.comentarios;
                btnSubmitForm.textContent = "Actualizar Tarea";
                btnCancelarEdicion.classList.remove("hidden");
                mostrarSeccion(seccionFormulario);
            }
        }
        if (target.classList.contains("btn-eliminar")) {
            const id = parseInt(target.dataset.id);
            if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
                tareas = tareas.filter(t => t.id !== id);
                guardarTareas();
                renderizarTareas();
                if (parseInt(inputIdTarea.value) === id) {
                    resetearFormulario();
                }
            }
        }
    });

    btnCancelarEdicion.addEventListener("click", resetearFormulario);
    filtroCategoriaListaSelect.addEventListener("change", renderizarTareas);
    ordenarPorFechaSelect.addEventListener("change", renderizarTareas);

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    mostrarSeccion(seccionDashboard);
});
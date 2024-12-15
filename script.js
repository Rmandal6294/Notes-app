// Get elements
const addNoteBtn = document.getElementById("addNoteBtn");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const cancelBtn = document.getElementById("cancelBtn");
const modal = document.getElementById("modal");
const noteText = document.getElementById("noteText");
const notesContainer = document.getElementById("notesContainer");
const searchInput = document.getElementById("searchInput");
const fileInput = document.getElementById("fileInput");
const linkInput = document.getElementById("linkInput");
const videoInput = document.getElementById("videoInput");
const audioInput = document.getElementById("audioInput");
const contentModal = document.getElementById("contentModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalContentContainer = document.getElementById("modalContentContainer");

// Load notes from localStorage
function loadNotes() {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    notesContainer.innerHTML = "";  // Clear the container
    savedNotes.forEach(note => {
        createNoteElement(note);
    });
}

// Create a new note element (with image, PDF, video, audio, and text)
function createNoteElement(noteContent) {
    const note = document.createElement("div");
    note.classList.add("note");
    note.setAttribute("data-id", noteContent.id); // Set the unique id for the note

    // Display the text content
    const noteTextPara = document.createElement("p");
    noteTextPara.innerHTML = noteContent.text || "";
    note.appendChild(noteTextPara);

    // If there's a link, display it as a clickable link
    if (noteContent.link) {
        const noteLink = document.createElement("a");
        noteLink.href = noteContent.link;
        noteLink.target = "_blank";
        noteLink.textContent = "Click here for the link";
        note.appendChild(noteLink);
    }

    // Display image if there is one
    if (noteContent.image) {
        const noteImage = document.createElement("img");
        noteImage.src = noteContent.image;  // base64 image
        noteImage.alt = "Uploaded image";
        noteImage.style.maxWidth = "100%";
        noteImage.style.cursor = "pointer";
        noteImage.onclick = () => viewContent(noteContent.image, "image");
        note.appendChild(noteImage);
    }

    // Display PDF if there is one
    if (noteContent.pdf) {
        const notePDF = document.createElement("embed");
        notePDF.src = noteContent.pdf;  // base64 PDF
        notePDF.type = "application/pdf";
        notePDF.style.width = "100%";
        notePDF.style.height = "400px";
        notePDF.style.cursor = "pointer";
        notePDF.onclick = () => viewContent(noteContent.pdf, "pdf");
        note.appendChild(notePDF);
    }


    // Create delete button for each note
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("deleteBtn");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteNote(noteContent.id); // Pass the id of the note
    note.appendChild(deleteBtn);

    notesContainer.appendChild(note);
}

// Save notes to localStorage
function saveNotesToLocalStorage(notes) {
    localStorage.setItem("notes", JSON.stringify(notes));
}

// View content (image or PDF) in a modal
function viewContent(content, type) {
    contentModal.style.display = "flex";
    modalContentContainer.innerHTML = ""; // Clear previous content

    if (type === "image") {
        const img = document.createElement("img");
        img.src = content;
        img.style.maxWidth = "100%";
        modalContentContainer.appendChild(img);
    } else if (type === "pdf") {
        const pdf = document.createElement("embed");
        pdf.src = content;
        pdf.type = "application/pdf";
        pdf.style.width = "100%";
        pdf.style.height = "500px";
        modalContentContainer.appendChild(pdf);
    }
}

// Close content modal
closeModalBtn.addEventListener("click", function() {
    contentModal.style.display = "none";
});

// Add a new note
addNoteBtn.addEventListener("click", function() {
    modal.style.display = "flex";
    noteText.value = "";  // Clear the textarea
    fileInput.value = ""; // Clear the file input
    videoInput.value = ""; // Clear the video input
    audioInput.value = ""; // Clear the audio input
    linkInput.value = ""; // Clear the link input
});

// Close the modal
cancelBtn.addEventListener("click", function() {
    modal.style.display = "none";
});

// Save the note when clicked on "Save Note"
saveNoteBtn.addEventListener("click", function() {
    const noteContent = {
        id: Date.now(), // Unique ID based on timestamp
        text: noteText.value.trim(),
        link: linkInput.value.trim() || null,
        image: null,
        pdf: null,
        video: null,
        audio: null
    };

    // Handle file upload (image, PDF, video, audio)
    const file = fileInput.files[0];
    const video = videoInput.files[0];
    const audio = audioInput.files[0];

    // Handle image file
    if (file && file.type.startsWith("image")) {
        const reader = new FileReader();
        reader.onloadend = function() {
            noteContent.image = reader.result;  // base64 image
            saveNoteToStorage(noteContent);
        };
        reader.readAsDataURL(file); // Convert the file to base64
    }

    // Handle PDF file
    else if (file && file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onloadend = function() {
            noteContent.pdf = reader.result;  // base64 PDF
            saveNoteToStorage(noteContent);
        };
        reader.readAsDataURL(file); // Convert the file to base64
    }

    // Handle video file
    else if (video) {
        const reader = new FileReader();
        reader.onloadend = function() {
            noteContent.video = reader.result;  // base64 video
            saveNoteToStorage(noteContent);
        };
        reader.readAsDataURL(video); // Convert the file to base64
    }

    // Handle audio file
    else if (audio) {
        const reader = new FileReader();
        reader.onloadend = function() {
            noteContent.audio = reader.result;  // base64 audio
            saveNoteToStorage(noteContent);
        };
        reader.readAsDataURL(audio); // Convert the file to base64
    }

    // If no file is selected, save just the text
    if (!file && !video && !audio) {
        saveNoteToStorage(noteContent);
    }
});

// Function to save the note to localStorage
function saveNoteToStorage(noteContent) {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes.push(noteContent);
    saveNotesToLocalStorage(savedNotes);
    createNoteElement(noteContent);  // Add note to the UI
    modal.style.display = "none"; // Close the modal after saving
}

// Delete a note by its unique ID
function deleteNote(noteId) {
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    savedNotes = savedNotes.filter(note => note.id !== noteId); // Remove the note by ID
    saveNotesToLocalStorage(savedNotes);
    loadNotes();  // Reload notes to reflect the deletion in the UI
}

// Search notes
searchInput.addEventListener("input", function() {
    const searchText = searchInput.value.toLowerCase();
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    notesContainer.innerHTML = "";  // Clear the notes container

    const filteredNotes = savedNotes.filter(note =>
        note.text.toLowerCase().includes(searchText) ||
        (note.link && note.link.toLowerCase().includes(searchText))
    );
    filteredNotes.forEach(note => {
        createNoteElement(note);
    });
});

// Load the notes when the page is loaded
loadNotes();

const homePage_b = document.getElementById("home_tab");
const aboutPage_b = document.getElementById("about_tab");
const contactPage_b = document.getElementById("contact_tab");

const homePage = document.getElementById("home");
const aboutPage = document.getElementById("about");
const contactPage = document.getElementById("contact");

// Navigate to the home page when the home button is clicked
homePage_b.addEventListener("click", function() {
    aboutPage.style.display = "none";
    contactPage.style.display = "none";
    homePage.style.display = "block";
    loadNotes();
});
aboutPage_b.addEventListener("click", function() {
    aboutPage.style.display = "block";
    contactPage.style.display = "none";
    homePage.style.display = "none";
    loadNotes();
});
contactPage_b.addEventListener("click", function() {
    aboutPage.style.display = "none";
    contactPage.style.display = "block";
    homePage.style.display = "none";
    loadNotes();
});

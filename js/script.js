const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const UPDATED_EVENT = "updated-book";
const REMOVED_EVENT = "removed-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isRead) {
  return {
    id,
    title,
    author,
    year,
    isRead,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const incompletBookshelfList = document.getElementById(
    "incompletBookshelfList"
  );
  incompletBookshelfList.innerHTML = "";

  const completedBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  completedBookshelfList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isRead) {
      incompletBookshelfList.append(bookElement);
    } else completedBookshelfList.append(bookElement);
  }
});

document.addEventListener(SAVED_EVENT, function () {
  const snackbar = document.getElementById("snackbar");
  snackbar.classList.add("show", "green-notif");

  snackbar.innerHTML = '<p>"Buku berhasil ditambahkan"</p>';
  setTimeout(function () {
    snackbar.className = snackbar.className.replace("show", "");
    snackbar.className = snackbar.className.replace("green-notif", "");
  }, 3000);
});

document.addEventListener(UPDATED_EVENT, function () {
  const snackbar = document.getElementById("snackbar");
  snackbar.classList.add("show", "yellow");

  snackbar.innerHTML = '<p>"Data buku telah diperbarui"</p>';
  setTimeout(function () {
    snackbar.className = snackbar.className.replace("show", "");
    snackbar.className = snackbar.className.replace("yellow", "");
  }, 3000);
});

document.addEventListener(REMOVED_EVENT, function () {
  const snackbar = document.getElementById("snackbar");
  snackbar.classList.add("show", "red-notif");

  snackbar.innerHTML = '<p>"Buku berhasil dihapus"</p>';
  setTimeout(function () {
    snackbar.className = snackbar.className.replace("show", "");
    snackbar.className = snackbar.className.replace("red-notif", "");
  }, 3000);
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function addBook() {
  const titleBook = document.getElementById("inputBookTitle").value;
  const authorBook = document.getElementById("inputBookAuthor").value;
  const yearBook = document.getElementById("inputBookYear").value;
  const readBook = document.getElementById("inputBookIsRead").checked;
  const generatedID = generateId();

  const bookObject = generateBookObject(
    generatedID,
    titleBook,
    authorBook,
    yearBook,
    readBook
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  document.dispatchEvent(new Event(SAVED_EVENT));
  saveData();
}

function addBookToRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isRead = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  document.dispatchEvent(new Event(UPDATED_EVENT));
  saveData();
}

function removeBookFromRead(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  document.dispatchEvent(new Event(REMOVED_EVENT));
  saveData();
}

function undoBookFromRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isRead = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  document.dispatchEvent(new Event(UPDATED_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("book-detail");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("article");
  container.classList.add("book-item", "glass-bg");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isRead) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("btn-action", "yellow");
    undoButton.innerText = "Belum selesai dibaca";

    undoButton.addEventListener("click", function () {
      undoBookFromRead(bookObject.id);
    });

    const trashButton = document.createElement("i");
    trashButton.classList.add("fa-solid", "fa-trash-can");

    const trashButtonContainer = document.createElement("button");
    trashButtonContainer.classList.add("btn-action", "red");
    trashButtonContainer.append(trashButton);

    trashButton.addEventListener("click", function () {
      removeBookFromRead(bookObject.id);
    });

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");
    actionContainer.append(undoButton, trashButtonContainer);

    container.append(actionContainer);
  } else {
    const readButton = document.createElement("button");
    readButton.classList.add("btn-action", "green");
    readButton.innerText = "Selesai dibaca";

    readButton.addEventListener("click", function () {
      addBookToRead(bookObject.id);
    });

    const trashButton = document.createElement("i");
    trashButton.classList.add("fa-solid", "fa-trash-can");

    const trashButtonContainer = document.createElement("button");
    trashButtonContainer.classList.add("btn-action", "red");
    trashButtonContainer.append(trashButton);

    trashButton.addEventListener("click", function () {
      removeBookFromRead(bookObject.id);
    });

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");
    actionContainer.append(readButton, trashButtonContainer);

    container.append(actionContainer);
  }

  return container;
}

const { response } = require('@hapi/hapi/lib/validation');
const { nanoid } = require('nanoid');
const bookshelf = require('./books');

const addBook = (request, h) => {
    //add book by name
    const {
        name,
        year, 
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;
    
    // failure if name is not given
    if (name === undefined) {
        const response = h.response({
            status: 'fail', 
            message: "Gagal menambahkan buku. Mohon isi nama buku"
        });
        response.code(400);
        return response; 
    }
    
    // failure if readPage > pageCount 
    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
        });
        response.code(400);
        return response;
    }
    
    // fill book object data 
    const id = nanoid(16);
    const insertedAt  = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;

    const newBook = {
        id,
        name, 
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
    };
    bookshelf.push(newBook);

    // check if book is successfully added in bookshelf
    const isSuccess = bookshelf.filter((book) => book.id === id).length > 0;

    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        });
        response.code(201);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
};

const getBookshelf = (request, h) => {
    // show all books in bookshelf 

    const {
        name, 
        reading,
        finished,
    } = request.query;

    let filteredBookshelf = bookshelf;

    // filter by name / reading / finished query 
    if (name !== undefined) {
        filteredBookshelf = filteredBookshelf.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (reading !== undefined) {
        filteredBookshelf = filteredBookshelf.filter((book) => book.reading === !!Number(reading));
    }
    if (finished !== undefined) {
        filteredBookshelf = filteredBookshelf.filter((book) => book.finished === !!Number(finished));
    }
    // IDK, Dicoding should expand this part here...: 
    // https://www.dicoding.com/academies/261/tutorials/14732 
    // https://www.w3schools.com/jsref/jsref_filter.asp
    // https://www.w3schools.com/jsref/jsref_includes.asp
    // https://www.w3schools.com/jsref/jsref_map.asp

    const response = h.response({
        status: 'success',
        data: {
        books: filteredBookshelf.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
        })),
        },
    });
    response.code(200);
    return response;
};

const getBook = (request, h) => {
    // show book by id 
    const { bookId } = request.params;

    // const book = bookshelf.filter((book) => book.id === bookId)[0];
    const index = bookshelf.findIndex((book) => book.id === bookId);

    if (index !== -1) {
        const response = h.response({
            status: 'success', 
            data: {
                book: bookshelf[index]
            }
        });
        response.code(200);
        return response;
    }

    // if (book !== undefined) {
    //     return {
    //         status: 'success',
    //         data: {
    //             book,
    //         },
    //     };
    // }

    const response = h.response({
        status: 'fail', 
        message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
};

const editBook = (request, h) => {
    const { bookId } = request.params;
    
    const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,        
    } = request.payload;
    const updatedAt = new Date().toISOString();
    
    // failure if name is not given 
    if (name === undefined) {
        const response = h.response({
            status: 'fail', 
            message: "Gagal memperbarui buku. Mohon isi nama buku"
        });
        response.code(400);
        return response; 
    }
    
    // failure if readPage > pageCount
    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }
    
    // edit book by id
    const index = bookshelf.findIndex((book) => book.id === bookId);

    if (index !== -1 ) {
        bookshelf[index] = {
            ...bookshelf[index],
            name, 
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            updatedAt,
        };

        const response = h.response({
            status: 'success', 
            message: 'Buku berhasil diperbarui',
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};

const deleteBook = (request, h) => {
    // delete book by id 
    const { bookId } = request.params;
    
    const index = bookshelf.findIndex((book) => book.id === bookId);

    if (index !== -1) {
        bookshelf.splice(index, 1);
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus',
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};


module.exports = {
    addBook,
    getBookshelf,
    getBook, 
    editBook,
    deleteBook,
};

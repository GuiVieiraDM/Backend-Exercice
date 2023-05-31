const { Router } = require('express');

const notesRoutes = Router();

const MovieNotesController = require('../controllers/movieNotesController');

const movieNotesController = new MovieNotesController();

notesRoutes.post('/:user_id', movieNotesController.create);
notesRoutes.get('/:id', movieNotesController.show);
notesRoutes.delete('/:id', movieNotesController.delete);
notesRoutes.get('/', movieNotesController.index);

module.exports = notesRoutes;
const { Router } = require('express');

const tagsRoutes = Router();

const MovieTagsController = require('../controllers/movieTagsController');

const movieTagsController = new MovieTagsController();

tagsRoutes.get('/:user_id', movieTagsController.index);

module.exports = tagsRoutes;
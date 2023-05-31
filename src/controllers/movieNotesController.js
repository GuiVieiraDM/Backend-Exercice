const knex = require('../database/knex');
const AppError = require('../utils/AppError')

class MovieNotesController {
  async create(req, res) {
    try {
      const { title, description, rating, tags } = req.body;
      const { user_id } = req.params;
      const invalidRating = rating < 0 || rating > 5;

      if(invalidRating) {
        throw new AppError('Nota inválida! Insira uma nota entre 0 e 5.')
      }
      
      const [ note_id ] = await knex('movie_notes').insert({
        title,
        description,
        rating,
        user_id
      })
      
      const tagsInsert = tags.map(name => {
        return {
          note_id,
          name,
          user_id
        }
      })
      
      await knex('movie_tags').insert(tagsInsert)
      
      res.json();
    } catch(error) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message })
      } else {
      res.status(500).json({ error: 'Ocorreu um erro ao cadastrar a nota!' });
      }
    }
  }

  async show(req, res) {
    const { id } = req.params;
    
    const note = await knex('movie_notes').where({id}).first();
    const tags = await knex('movie_tags').where({note_id: id}).orderBy('name');
    
    return res.json({
      ...note,
      tags
    })
  }

  async delete(req, res) {
    const { id } = req.params

    await knex('movie_notes').where({id}).delete();
    
    return res.json();
  }

  async index(req, res) {
    const { title, user_id, tags } = req.query

    let notes

    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim());

      notes = await knex('movie_tags')
      .select([
        'movie_notes.id',
        'movie_notes.title',
        'movie_notes.user_id'
      ])
      .where('movie_notes.user_id', user_id)
      .whereLike('movie_notes.title', `%${title}%`)
      .whereIn('name', filterTags)
      .innerJoin('movie_notes', 'movie_notes.id', 'movie_tags.note_id')
      .orderBy('movie_notes.title')
    }else{
      notes = await knex('movie_notes')
      .where({user_id})
      .whereLike('title', `%${title}%`)
      .orderBy('title')
    }

    const userTags = await knex('movie_tags')
    .where({user_id})

    const notesWithTags = notes.map(note => {
      const noteTag = userTags.filter(tag => tag.note_id === note.id)
      
      return {
        ...note,
        tags: noteTag
      }
    })

    return res.json({ notesWithTags })

  }
}

module.exports = MovieNotesController;
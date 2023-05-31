const { hash, compare } = require('bcryptjs');
const AppError = require('../utils/AppError');
const knex = require('../database/knex');

class usersController {
  async create(req, res) {
    try {
      const { name, email, password } = req.body;
      
      const userExists = await knex('users').where('email', email).first();
      if (userExists) {
        throw new AppError('E-mail já cadastrado!');
      }
      
      const hashedPassword = await hash(password, 8)
      
      await knex('users').insert({
        name,
        email,
        password: hashedPassword
      })
      
      res.json();
    } catch(error) {
      if (error instanceof AppError) {
        res.json({ error: error.message })
      } else {
      res.status(500).json({ error: 'Ocorreu um erro ao cadastrar o usuário!' });
      }
    }
  }

  async update(req, res) {
    try {
      const { name, email, password, old_password } = req.body;
      const { id } = req.params;
      
      const user = await knex('users').where('id', id).first();
      
      if(!user) {
        throw new AppError('Usuário não encontrado!')
      }
      
      const userWithUpdatedEmail = await knex('users').where('email', email).first();
      
      if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
        throw new AppError('Email já está cadastrado!')
      }
      
      user.name = name ?? user.name
      user.email = email ?? user.email
      
      if(password && !old_password) {
        throw new AppError('Você precisa informar a senha atual');
      }

      if (password && old_password) {
        const checkOldPassword = await compare(old_password, user.password);
        
        if (!checkOldPassword) {
          throw new AppError('Senha atual incorreta');
        }
        
        user.password = await hash(password, 8);
      }

      await knex('users').where('id', id).update({
        name,
        email,
        password: user.password
      })
      
      return res.json()
    } catch(error) {
      if (error instanceof AppError) {
        res.status(400).json({ error: error.message })
      } else {
      res.status(500).json({ error: 'Ocorreu um erro ao cadastrar o usuário!' });
      }
    }
  }
}

module.exports = usersController
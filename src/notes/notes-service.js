/* eslint-disable no-undef */
const notesService = {
    getAllNotes(knex){
        return knex
            .select('*')
            .from('notes')
    },
    insertNotes(knex, newNote){
        return knex
            .insert(newNote)
            .into('notes')
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    getNoteById(knex, id){
        return knex
            .from('notes')
            .where('note_id', id)
            .first()
    },
    deleteNote(knex, id){
        return knex('notes')
            .where('note_id', id)
            .delete()
    },
    updateNote(knex, id, updatedNote){
        return knex('notes')
            .where('note_id', id)
            .update(updatedNote)
    }
}

module.exports = notesService;
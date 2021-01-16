/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const path = require('path');
const express = require('express');
const xss = require('xss');
const foldersService  = require('./folders-service');


const folderRouter = express.Router();
const jsonParser = express.json();

const serializedFolder = folder => ({
    folder_id : folder.folder_id,
    folder_name : xss(folder.folder_name)
});

folderRouter
.route('/')
.get((req, res, next) => {
    const db = req.app.get('db')
    foldersService.getAllFolders(db)
    .then(folders=> {
        res.json(folders.map(serializedFolder));
    })
    .catch(next);
})
.post(jsonParser, (req, res, next)=> {
    const {folder_name} = req.body;
    const newFolder = {folder_name};

    for(const [key, value] of Object.entries(newFolder))
    if(value == null)
    return res.status(400).json({
        error: {message : `Missing '${key}' in request body`}
    })
    foldersService.insertFolders(
        req.app.get('db'),
        newFolder
    )
    .then(folder => {
        res.status(201)
            .location(path.posix.join(req.originalUrl, `/${folder.folder_id}`))
            .json(serializedFolder(folder))
    })
    .catch(next)
})

folderRouter
.route('/:folder_id')
.all((req, res, next)=> {
    foldersService.getFolderById(
        req.app.get('db'),
        req.params.folder_id
    )
    .then(folder => {
        if(!folder){
            return res.status(404).json({
                error: {message: `Folder doesn't exist`}
            })
        }
        res.folder = folder;
        next()
    })
    .catch(next)
})
.get((req, res, next) => {
    res.json(serializedFolder(res.folder))
})
.delete((req, res, next)=> {
    foldersService.deleteFolder(
        req.app.get('db'),
        req.params.folder_id
    )
    .then(()=>{
        res.status(204).end()
    })
    .catch(next)
})
.patch(jsonParser, (req, res, next)=> {
    const {folder_name} = req.body;
    const FolderToUpdate = {folder_name};

    const numberOfValues = Object.values(FolderToUpdate).filter(Boolean).length
    if(numberOfValues === 0 )
    return res.status(400).json({
        error : {message: `Request body must contain folder_name`}
    })
    foldersService.updateFolder(
        req.app.get('db'),
        req.params.folder_id,
        FolderToUpdate
    )
    .then(()=> {
        res.status(204).end()
    })
    .catch()
})

module.exports = folderRouter;
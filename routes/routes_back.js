const express = require('express');
const { Router } = express;
const { mysql } = require('../db/db-config');
const Productos = require('../classes/Productos');

const Producto = new Productos(mysql);

const router = new Router();

router.get('/',(req, res, next) =>{
    Producto.getAll().then(result => {
        if (result !== undefined) {
            res.status(200).json({
                message: `Productos`,
                result: result
            });
        } else {
            res.status(404).json({
                error: `No existen productos`,
            });
        }
    });
    
});

router.get('/:id',(req, res, next) => {
    let id = req.params.id;
    Producto.getById(id).then(result => {
        if (result !== undefined) {
            if (result === null) {
                res.status(404).json({
                    error: `Producto no encontrado para el id ${id}`,
                });
            } else {
                res.status(200).json({
                    message: `Producto ID: ${id}`,
                    result: result
                });
            }
        } else {
            res.status(404).json({
                error: `El archivo no se puede leer`,
            });
        }
    });
});

router.post('/',(req, res, next) => {
    // console.log(req.body)
    let { title, price, thumbnail } = req.body;
    
    let nuevoProducto = {
        title,
        price,
        thumbnail
    }
    Producto.save(nuevoProducto).then(result => {
        // console.log(result)
        if (result !== undefined) {
            res.status(200).json({
                message: `Nuevo producto`,
                result: result
            });
        } else {
            res.status(404).json({
                error: `No se pudo guardar el producto`,
            });
        }
    });
});

router.put('/:id',(req, res, next) => {
    let id = req.params.id;
    let { title, price, thumbnail } = req.body;
    let editarProducto = {
        title,
        price,
        thumbnail
    }
    Producto.updateById(id, editarProducto).then(result => {
        console.log(result)
        if (result !== undefined) {
            res.status(200).json({
                message: `Editar producto ${id}`,
                result: result
            });
        } else {
            res.status(404).json({
                error: `No se pudo modificar el producto`,
            });
        }
    });
});

router.delete('/:id',(req, res, next) => {
    let id = req.params.id;
    Producto.deleteById(id).then(result => {
        if (result !== undefined) {
            res.status(200).json({
                message: `Eliminar producto ${id}`,
                result: result
            });
        } else {
            res.status(404).json({
                error: `No se pudo eliminar el producto`,
            });
        }
    });
});

router.use((req, res, next) => {
    const error = new Error('Ruta no encontrada');
    error.status = 404;
    next(error);
});

router.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = router;

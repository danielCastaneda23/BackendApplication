const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)

const routerProductos = express.Router();
const routerProductosApi = express.Router()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/public',express.static('public'));

app.set('view engine', 'ejs');
// app.set('views', './views/layouts');



let productos = [
    {
        title: "Escuadra",
        price: 123.45,
        thumbnail: "https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png",
        id: 1,
    },
    {
        title: "Pencil",
        price: 123.45,
        thumbnail: "https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png",
        id: 2,
    },
]

let mensajes = [
    {
        email: 'prueba@prueba.com',
        mensaje: 'Hola Compañeros',
        fecha: 'Sat, 13 Jun 2020 18:30:00 GMT',
    }
]

routerProductos.get('/productos', (req, res) => {
    !!productos.length ? res.json(productos) : res.status(404).json({ error: 'No hay productos cargados' })
})

routerProductos.get('/productos/:id', (req, res) => {
    let id = (req.params.id)
    if (id === 'vista') res.render('main', {productsList: productos})
    else {
        id = parseInt(req.params.id)
        let producto = productos.find(x => x.id === id)
        !!producto ? res.json(producto) : res.status(404).json({ error: 'Producto No Encontrado' })
    }

})

routerProductos.post('/productos', (req, res) => {
    objeto = req.body
    productos.push(
        {
            ...objeto,
            id: productos.length + 1
        }
    )
    res.render('main', {productsList: productos})
})

routerProductosApi.put('/actualizar/:id', (req, res) => {
    objeto = req.body;
    id = parseInt(req.params.id);

    productos.map(x => {
        if (x.id === id) {
            x.title = objeto.title;
            x.price = objeto.price;
            x.thumbnail = objeto.thumbnail
        }
        return x
    });
    res.json(productos)
})

routerProductosApi.delete('/borrar/:id', (req, res) => {
    id = req.params.id;
    productos = productos.filter(x => x.id != id);
    res.json(`El producto con id numero: ${id} ha sido borrado`)
})

io.on('connection', (socket) => {
    io.emit('chat', mensajes)
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });

    socket.on('Mensajes', (msg) => {
        let fecha = new Date()
        mensajes.push({...msg, fecha: `${fecha.getDate()}/${fecha.getMonth()}/${fecha.getFullYear()}  ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`});
        console.log(mensajes)
        io.emit('chat', mensajes)
    })
    io.emit('products', productos)
    
})

app.use('/api', routerProductos)
app.use('/api/productos', routerProductosApi)


PUERTO = 8000;

server.listen(PUERTO, () => {
    console.log(`Server Iniciado en el puerto ${server.address().port}`)
})
server.on('error', error => console.log(`El error en el servidor es  ${error}`))
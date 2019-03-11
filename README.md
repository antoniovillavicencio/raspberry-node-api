# Hospeda tu API de Node en una Raspberry Pi

[TOC]

En las siguientes líneas compartiré los pasos que seguí para poder hospedar una aplicación de Node.js en una Raspberry Pi 3 y acceder a ella a través de una conexión segura HTTPS desde cualquier sitio con internet (no solo dentro de la misma red). La aplicación que hice es una API muy sencilla que únicamente regresa un JSON con una petición GET. 


## Pre-requisitos
Para seguir los pasos que vienen, es necesario tener conocimiento mínimo de los comandos más comunes en consola de comandos y cómo levantar un servidor de Node.js de manera local. Adicionalmente, ayudará mucho si tienes algo de familiaridad con editores de texto desde consola como *vim* o *nano*.

### Hardware
- Raspberry Pi 3 (RPi)
- Tarjeta microSD de al menos 8GB
- Teclado + mouse USB
- Monitor con cable HDMI
- Computadora de escritorio (yo usé mac)

---

## Instalando Raspbian
Raspbian es el sistema operativo (SO) oficial de Raspberry y el que usaremos para nuestro proyecto. Para descargarlo e instalarlo en tu RPi sigue [estos pasos](https://www.raspberrypi.org/downloads/). Una vez instalado, necesitas conectarle a la RPi un teclado, mouse y monitor para poder manejarlo. Asegúrate que esté conectado a internet y configura cosas básicas como la zona horaria, contraseña, idioma, etc. 

## Accediendo a la RPi por SSH

No siempre tendremos un teclado USB y un monitor a la mano para configurar  y controlar la RPi. Una manera de manejar la tarjeta desde nuestro equipo de escritorio es usando el protocolo SSH. Si la RPi está conectada a la misma red que nuestro equipo de escritorio, podremos acceder a ella de manera remota sin necesidad de Hardware externo. 

Primero, necesitas tener la IP de la RPi. En la terminal, teclea `hostname -I` para obtenerla. Después, accesa a la configuración de la RPi con `sudo raspi-config`y habilita el acceso por SSH (está bajo *Interfacing options*). Finalmente, desde la terminal de tu computadora, accede usando `ssh pi@xxx.xxx.x.xxx` donde las *x's* denotan la IP de la tarjeta. 

> Para cerrar la conexión, teclea `ctrl + D`

## Instalando Node en la RPi

Por default, Rapsbian incluye una versión desactualizada de Node.js. Para asegurarnos de tener la versión LTS más actualizada, necesitaremos un manejador de versiones. En mi caso, escogí [n](https://github.com/tj/n) por su facilidad de uso. Para instalarlo, necesitamos un manejador de paquetes para Node (elegí *npm*). 

Para instalar *npm*,  desde la terminal de la RPi:

```bash
sudo apt-get install npm
```

Para instalar *n*:

```bash
npm install -g n
```

Si queremos listar las versiones de Node instaladas en el sistema podemos usar `n ls`. Para instalar la última versión LTS de Node:

```bash
sudo n lts install
```

Si queremos cambiar entre versiones, 

```bash
n <version>
```

## Instalando y configurando *Vim* en la RPi

*Vim* es un editor de texto en la consola muy poderoso. En la RPi, puedes instalarlo con

```bash
sudo apt-get install vim
``` 

Para personalizarlo, modifica el archivo *~/.vimrc*. Para abrir un archivo con *vim* solo teclea desde la consola `vim <fileName>`. En nuestro caso, si queremos configurarlo:

```bash
vim ~/.vimrc
```

 Recomiendo la siguiente configuración (este paso es opcional):
 
```bash
syntax on
colorscheme slate
set expandtab
set shiftwidth=4
set softtabstop=4
set number
set showcmd
```

## Copiando archivos desde la Mac a la RPi

Ya que tienes tu RPi con Node y npm instalados, puedes escribir todo el código para tu aplicación de Node desde la misma RPi o a través de SSH con algún editor como *vim* o *nano*. Lo más probable es que ya tengas tu proyecto escrito en tu computadora de escritorio y solo necesitas copiarlo a la RPi. Para evitar el uso de memorias USB y conectar un monitor a la RPi, enviaremos los archivos por SSH.  
Para copiar archivos por SSH se usa el comando `scp`. Desde la consola de comandos de tu computadora de escritorio: 

```bash
scp -r <source> pi@xxx.xxx.x.xxx:<destination>
```

donde `<source>` es el archivo que quieres mandar y `<destination>` la ruta donde quieres mandarlo. La `-r` es para que sea recursivo y mande varios archivos a la vez. Si te encuentras en el directorio fuente, para mandar todo lo que está ahí indicalo con `*`, e.g.

```bash
scp -r * pi@192.168.0.20:/home/pi/app/
```

En este caso, estamos transfiriendo todos los archivos del directorio local al directorio */home/pi/app/* de la RPi. 

> Es importante escribir la ruta completa del lado de la RPi. En [este link](https://linuxacademy.com/blog/linux/ssh-and-scp-howto-tips-tricks/) encuentras más información sobre `scp`.

## Probando que nuestro servidor funciona de manera local

Ya que tienes tu proyecto en la RPi, es hora de probarlo. Usando la conexión SSH, ejecuta el comando que inicie tu servidor de Node en la RPi, e.g.:

```bash
node index.js
```

Desde tu computadora de escritorio, si estás en la misma red deberías de poder acceder en la ruta *http://xxx.xxx.x.xxx:PORT*, donde las `x` denotan la dirección IP de la RPi y `PORT` el puerto que configuraste para tu proyecto. 

## Corriendo el servidor al arranque
Queremos que el servidor se inicie al inicializar el sistema de la RPi y no hacerlo manualmente como en el paso anterior. Para ello hay que modificar el archivo */etc/rc.local* de la RPi e incluir los comandos que queremos ejecutar. En nuestro ejemplo añadimos la siguiente línea en *rc.local* : 

```bash
su pi -c 'node /home/pi/app/index.js < /dev/null &'
```

Nota que estamos usando rutas absolutas para el punto de entrada de nuestra aplicación. 

> Para apagar la RPi desde la terminal, `sudo shutdown -h now`; para reiniciarla `sudo reboot`

## Conectando la RPi al mundo exterior
Hasta ahora podemos acceder al servidor en la RPi desde la misma red. Si queremos que nuestra API sea realmente funcional, necesitamos que sea accesible desde cualquier sitio con internet. Una forma de hacerlo es redireccionando los puertos del router al que está conectada nuestra tarjeta, sin embargo, si no se hace bien podría ser inseguro pues estamos exponiendo un puerto de nuestra red local a todo el mundo. Hay servicios como [Dataplicity](https://www.dataplicity.com/) que nos permiten hacer lo mismo pero añadiendo una capa de seguridad, de tal forma que podemos acceder a nuestro servidor casero desde una URL HTTPS. 

Primero, necesitamos crear una cuenta gratuita en Dataplicity. Una vez registrado, te mostrará un comando que debes de correr desde tu RPi. 

![15522541018833](media/15522705838459/15522541018833.jpg)

Al terminar de instalar el agente de Dataplicity, te mostrará una URL desde donde podrás administrar tu dispositivo. También puedes acceder a ella desde la sección *Devices* del sitio web de Dataplicity. 

Habilita la opción de `wormhole` en el panel de configuración. La dirección que te proporciona Dataplicity habilita el puerto 80 del localhost. 

![Screen Shot 2019-03-11 at 12.10.15 A -w350](media/15522705838459/Screen%20Shot%202019-03-11%20at%2012.10.15%20AM.png)

Para configurar el puerto de tu RPi y ligarlo con el puerto de Node, necesitamos [nginx](https://www.nginx.com/). Desde la consola de RPi:

```bash
sudo apt-get install nginx
```

Una vez instalado *nginx*, deberíamos de poder ver un mensaje de *Welcome to nginx* desde la URL proporcionada por Dataplicity. Para configurar este servicio, modificaremos el archivo */etc/nginx/sites-available/default*. Borra todo lo que contiene y escribe

```bash
server {
    listen 80;
server_name miAPI.com;
location / {
        proxy_pass http://xxx.xxx.x.xxx:NODE_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

donde `NODE_PORT` es el puerto que configuraste en tu aplicación y las `x` denotan la dirección IP de la RPi. Finalmente, reinicia el servicio de nginx:

```bash
sudo service nginx restart
```

---
Listo! Si visitas la URL que proporcionó Dataplicity podrás acceder a tu API hospedada en tu RPi. Todo se iniciará automáticamente al energizar la RPi. 

## ¿Qué sigue?
Felicidades! Has logrado configurar tu Raspberry para que pueda alojar tu aplicación de Node y la haga pública mediante una URL HTTPS. Ya puedes acceder a tu API desde cualquier sitio con internet. Una ventaja adicional de la Raspberry es la gran variedad de puertos digitales y analógicos con los que cuenta. En Node.js hay un módulo llamado [onoff](https://www.npmjs.com/package/onoff) que te permite controlar y acceder a estos puertos desde tu aplicación de Node. Esto significa que puedes leer sensores, controlar aparatos electrónicos, manejar motores y un sinfín de cosas más mediante peticiones HTTP de manera segura. Imagina una API que te permita apagar las luces de tu casa! Lo que hiciste hasta ahora es una interfaz que permite conectar tu software con el mundo físico. 

Compárte tus proyectos, ideas, inquietudes y lo que se te ocurra a tonyvcj@gmail.com

## Fuentes
https://blog.cloudboost.io/how-to-run-a-nodejs-web-server-on-a-raspberry-pi-for-development-3ef9ac0fc02c
https://medium.com/@andrew.nease.code/set-up-a-self-booting-node-js-eb56ebd05549
https://eladnava.com/binding-nodejs-port-80-using-nginx/
https://www.raspberrypi.org/documentation/remote-access/access-over-Internet/


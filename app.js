const express = require('express');
const formidable = require('formidable');
const path = require('path');
const sassMiddleware = require('sass-middleware');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(
  sassMiddleware({
    src: path.join(__dirname, 'styles/scss'),
    dest: path.join(__dirname, 'styles/css'),
    debug: true,
    outputStyle: 'compressed',
    prefix: '/css',
  })
);

app.use(express.static(path.join(__dirname, 'styles')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('form');
});

app.post('/submit', (req, res) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, 'uploads'); 
  form.keepExtensions = true; 

  form.parse(req, (err, fields, files) => {

    if (err) {
      res.status(500).send("Erreur lors de l'envoi du formulaire.");
      return;
    }

    if (files && files.file[0].originalFilename) {
      const ext = path.extname(files.file[0].originalFilename)
      const newFileName = `image_${Date.now()}${ext}`; 
      const newFilePath = path.join(form.uploadDir, newFileName); 
      
      fs.rename(files.file[0].filepath, newFilePath, (err) => {
        if (err) {
          return res.status(500).send("Erreur lors du renommage du fichier.");
        }

        files.file[0].filepath = newFilePath; 
        console.log(newFilePath);
        
        res.render('result', { fields, files, path });
      });
    }else {
      res.status(400).send("Aucun fichier téléchargé.");
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

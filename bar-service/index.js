const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const barApi = require('./routes/bar-api');
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', barApi);

app.listen(PORT, () => {
  if (NODE_ENV === 'development') {
    console.log(`Bar API listening on port ${PORT} (development mode)`);
  } else {
      console.log(`Bar API listening on port ${PORT} (production mode)`);
  }
});

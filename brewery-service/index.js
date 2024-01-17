const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;
const breweryApi = require('./routes/brewery-api');
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', breweryApi);

app.listen(PORT, () => {
  if (NODE_ENV === 'development') {
    console.log(`Brewery API listening on port ${PORT} (development mode)`);
  } else {
      console.log(`Brewery API listening on port ${PORT} (production mode)`);
  }
});

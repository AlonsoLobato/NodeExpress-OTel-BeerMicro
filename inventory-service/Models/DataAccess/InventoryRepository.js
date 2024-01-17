// Contains functions related to inventory data interactions with the database
const BeerModel = require('../BeerModel');

const fetchBeersList = async () => {
  try {
    const beerList = await BeerModel.find({});    
    return beerList;
  } catch (error) {
    return { status: 500, message: error }
  } 
}

const fetchBeerById = async (beerId) => {
  try {
    const beer = await BeerModel.findById(beerId);
    if (!beer) {
      return {
        status: 404,
        message: `BeerModel with id '${beerId}' doesn't exist`
      };
    }
    return beer;
  } catch (error) {
    return { status: 500, message: error }
  }
}

const createBeer = async (beerInfo) => {
  const beerToAdd = {
    name: beerInfo.name,
    style: beerInfo.style,
    alcohol: beerInfo.alcohol,
    createdAt: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    updatedAt: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
  };

  try {
    const alreadyExist = await BeerModel.findOne({ name: beerToAdd.name });
    if (!!alreadyExist) {
      return {
        status: 400,
        message: `BeerModel with name '${beerToAdd.name}' already exists`,
      };
    }
    newBeer = new BeerModel(beerToAdd);
    newBeer.save();
    return newBeer;

  } catch (error) {
    return { status: error?.status || 500, message: error?.message || error }
  }
};

module.exports = {
  fetchBeersList,
  fetchBeerById,
  createBeer,
}

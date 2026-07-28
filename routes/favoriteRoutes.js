const express = require('express');
const router = express.Router();
const {
    AddToFavorite,
    RemoveFromFavorite,
    GetMyFavorites,
    CheckIsFavorited,
    GetFavoritesCount } = require('../controllers/favoriteController');


router.post('/add-favorites', AddToFavorite);

router.get('/remove-favorites', RemoveFromFavorite);

router.get('/my-favorites', GetMyFavorites);

router.get('/check-favorites', CheckIsFavorited);

router.get('/count-favorites', GetFavoritesCount);

module.exports = router;
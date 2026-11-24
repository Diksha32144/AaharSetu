const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const authMiddleware = require('../middleware/authMiddleware');

// Existing routes
router.post('/', authMiddleware, foodController.createFoodPost);
router.get('/', foodController.getAllFoodPosts);

// FIXED: Place specific static routes like '/my-posts' and '/nearby' BEFORE dynamic '/:id' routes
router.get('/my-posts', authMiddleware, foodController.getMyFoodPosts);
router.get('/nearby', foodController.getNearbyFoodPosts);

// Update food post status (Protected by authMiddleware)
router.patch('/:id/status', authMiddleware, foodController.updateFoodStatus);

// Delete a food post (Protected by authMiddleware)
router.delete('/:id', authMiddleware, foodController.deleteFoodPost);

module.exports = router;
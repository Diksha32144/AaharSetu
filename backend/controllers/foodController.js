const db = require('../db');

// Create a new food post (Donor only)
exports.createFoodPost = (req, res) => {
    const { food_title, quantity, expiry_time, latitude, longitude, address } = req.body;
    const donor_id = req.user.id; // Comes from authMiddleware

    if (!food_title || !quantity || !expiry_time || !latitude || !longitude || !address) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const query = `
        INSERT INTO food_posts (donor_id, food_title, quantity, expiry_time, latitude, longitude, address) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [donor_id, food_title, quantity, expiry_time, latitude, longitude, address], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Food post created successfully!', postId: result.insertId });
    });
};

// Get all available food posts
exports.getAllFoodPosts = (req, res) => {
    const query = `
        SELECT fp.*, u.name AS donor_name, u.phone AS donor_phone 
        FROM food_posts fp 
        JOIN users u ON fp.donor_id = u.id 
        WHERE fp.status = 'available' 
        ORDER BY fp.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

// Get food posts created by the logged-in donor
exports.getMyFoodPosts = (req, res) => {
    const donor_id = req.user.id; // Comes from authMiddleware

    const query = `
        SELECT * FROM food_posts 
        WHERE donor_id = ? 
        ORDER BY created_at DESC
    `;

    db.query(query, [donor_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};
// Update food post status (Donor only)
exports.updateFoodStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const donor_id = req.user.id; // Comes from authMiddleware

    // Validate allowed status values
    const validStatuses = ['available', 'claimed', 'completed'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Choose from: available, claimed, completed' });
    }

    // First, check if the post belongs to the logged-in donor
    const checkQuery = `SELECT * FROM food_posts WHERE id = ? AND donor_id = ?`;
    db.query(checkQuery, [id, donor_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(404).json({ message: 'Food post not found or unauthorized' });
        }

        // Update the status
        const updateQuery = `UPDATE food_posts SET status = ? WHERE id = ?`;
        db.query(updateQuery, [status, id], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            res.status(200).json({ message: `Food post status updated to '${status}' successfully!` });
        });
    });
};

// Delete a food post (Donor only)
exports.deleteFoodPost = (req, res) => {
    const { id } = req.params;
    const donor_id = req.user.id; // Comes from authMiddleware

    // First, check if the post belongs to the logged-in donor
    const checkQuery = `SELECT * FROM food_posts WHERE id = ? AND donor_id = ?`;
    db.query(checkQuery, [id, donor_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(404).json({ message: 'Food post not found or unauthorized' });
        }

        // Delete the post
        const deleteQuery = `DELETE FROM food_posts WHERE id = ?`;
        db.query(deleteQuery, [id], (deleteErr) => {
            if (deleteErr) return res.status(500).json({ error: deleteErr.message });
            res.status(200).json({ message: 'Food post deleted successfully!' });
        });
    });
};

// Get nearby available food posts using Haversine formula
exports.getNearbyFoodPosts = (req, res) => {
    const { latitude, longitude, radius = 10 } = req.query; // radius in kilometers, default to 10km if not provided

    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Please provide latitude and longitude coordinates' });
    }

    // Haversine formula query (calculates distance in kilometers)
    const query = `
        SELECT fp.*, u.name AS donor_name, u.phone AS donor_phone,
        (6371 * acos(
            cos(radians(?)) * cos(radians(fp.latitude)) * 
            cos(radians(fp.longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(fp.latitude))
        )) AS distance
        FROM food_posts fp
        JOIN users u ON fp.donor_id = u.id
        WHERE fp.status = 'available'
        HAVING distance <= ?
        ORDER BY distance ASC
    `;

    // Parameters: userLat, userLng, userLat, radius
    db.query(query, [latitude, longitude, latitude, radius], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};
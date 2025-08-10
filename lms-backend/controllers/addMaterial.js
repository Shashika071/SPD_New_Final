import pool from '../config/db.js';

// Function to add a material (existing code)
export const addMaterial = async (req, res) => {
  try {
    const { itemId, itemName, availableQty, unitPrice } = req.body;

    if (!itemId || !itemName || !availableQty || !unitPrice) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Insert material information into the database
    const [materialResult] = await pool.query(
      'INSERT INTO materials (item_id, item_name, available_qty, unit_price) VALUES (?, ?, ?, ?)',
      [itemId, itemName, availableQty, unitPrice]
    );

    const materialId = materialResult.insertId;

    // Insert images into the database
    if (req.files && req.files.length > 0) {
      const imageDetails = req.files.map((file) => ({
        path: file.path,
        type: file.mimetype,
        filename: file.filename,
      }));

      for (const image of imageDetails) {
        await pool.query(
          'INSERT INTO material_images (material_id, file_path, file_type, file_name) VALUES (?, ?, ?, ?)',
          [materialId, image.path, image.type, image.filename]
        );
      }
    }

    res.json({
      success: true,
      message: 'Material added successfully!',
      material: {
        id: materialId,
        itemId,
        itemName,
        availableQty,
        unitPrice,
        images: req.files ? req.files.map((file) => file.path) : [],
      },
    });
  } catch (error) {
    console.error('Error adding material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add the material. Please try again.',
      error: error.message,
    });
  }
};

// Function to list all materials (existing code)
export const getAllMaterials = async (req, res) => {
  try {
    const [materials] = await pool.query(
      'SELECT m.id, m.item_id, m.item_name, m.available_qty, m.unit_price, mi.file_name FROM materials m LEFT JOIN material_images mi ON m.id = mi.material_id'
    );

    const groupedMaterials = materials.reduce((acc, material) => {
      if (!acc[material.id]) {
        acc[material.id] = {
          id: material.id,
          itemId: material.item_id,
          itemName: material.item_name,
          availableQty: material.available_qty,
          unitPrice: material.unit_price,
          images: [],
        };
      }

      if (material.file_name) {
        // Add the file_name (image filename) instead of file_path
        acc[material.id].images.push(material.file_name);
      }

      return acc;
    }, {});

    const materialsList = Object.values(groupedMaterials);

    res.json({
      success: true,
      message: 'Materials fetched successfully',
      materials: materialsList,
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials. Please try again.',
      error: error.message,
    });
  }
};

// Function to update material's quantity and unit price
// Function to update material's quantity and unit price
export const updateMaterial = async (req, res) => {
  try {
    const { id, availableQty, unitPrice } = req.body;  // Get material ID from body

    if (!id || availableQty === undefined || unitPrice === undefined) {
      return res.status(400).json({ success: false, message: 'ID, Quantity, and Price are required.' });
    }

    // Update material details in the database
    const [updateResult] = await pool.query(
      'UPDATE materials SET available_qty = ?, unit_price = ? WHERE id = ?',
      [availableQty, unitPrice, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    res.json({
      success: true,
      message: 'Material updated successfully!',
    });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material. Please try again.',
      error: error.message,
    });
  }
};

// Function to delete a material
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.body;  // Get material ID from body

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID is required to delete material.' });
    }

    // Delete associated images first to avoid orphaned data
    await pool.query('DELETE FROM material_images WHERE material_id = ?', [id]);

    // Now delete the material
    const [deleteResult] = await pool.query('DELETE FROM materials WHERE id = ?', [id]);

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    res.json({
      success: true,
      message: 'Material deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material. Please try again.',
      error: error.message,
    });
  }
};
export const fetchAllMaterials = async (req, res) => {
  try {
    const [materials] = await pool.query(
      'SELECT id, item_id, item_name, available_qty, unit_price FROM materials'
    );

    res.json({
      success: true,
      message: 'Materials fetched successfully',
      materials,
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials. Please try again.',
      error: error.message,
    });
  }
};
// Backend endpoint to update the material quantity
export const updateMaterialQuantity = async (req, res) => {
  try {
    const { id, availableQty } = req.body;  // Get material ID and new available quantity from request body

    if (!id || availableQty === undefined) {
      return res.status(400).json({ success: false, message: 'ID and Quantity are required.' });
    }

    // Update material quantity in the database
    const [updateResult] = await pool.query(
      'UPDATE materials SET available_qty = ? WHERE id = ?',
      [availableQty, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    res.json({
      success: true,
      message: 'Material quantity updated successfully!',
    });
  } catch (error) {
    console.error('Error updating material quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material quantity. Please try again.',
      error: error.message,
    });
  }
};

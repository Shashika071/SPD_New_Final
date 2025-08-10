import './MaterialList.css';

import { Button, Form, Modal, Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

import { Container } from '@mui/material';
import axios from 'axios'; // Import axios to make HTTP requests

const MaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Fetch materials data from backend
  useEffect(() => {
    axios
      .get('http://localhost:4000/api/material/get') // Assuming the endpoint to get materials is '/api/materials'
      .then((response) => {
        setMaterials(response.data.materials);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch materials. Please try again.');
        setLoading(false);
      });
  }, []);

  // Function to delete a material
  const handleDelete = (id) => {
    axios
      .delete('http://localhost:4000/api/material/delete', { data: { id } }) // Send ID in the body for DELETE request
      .then(() => {
        setMaterials((prevMaterials) => prevMaterials.filter((material) => material.id !== id));
      })
      .catch((err) => {
        alert('Failed to delete material');
      });
  };

  // Function to open the update modal
  const handleUpdateOpen = (material) => {
    setCurrentMaterial(material);
    setNewQuantity(material.availableQty);
    setNewPrice(material.unitPrice);
    setShowUpdateModal(true);
  };

  // Function to handle the update action
  const handleUpdateSubmit = () => {
    if (newQuantity && newPrice) {
      axios
        .put('http://localhost:4000/api/material/update', {
          id: currentMaterial.id,
          availableQty: newQuantity,
          unitPrice: newPrice,
        })
        .then(() => {
          setMaterials((prevMaterials) =>
            prevMaterials.map((material) =>
              material.id === currentMaterial.id
                ? { ...material, availableQty: newQuantity, unitPrice: newPrice }
                : material
            )
          );
          setShowUpdateModal(false); // Close the modal after updating
        })
        .catch((err) => {
          alert('Failed to update material');
        });
    }
  };

  return (
    <Container className="list-material-container">
      <div className="container py-5">
        <h2 className="text-center mb-4" style={{ fontWeight: 600, color: '#333' }}>
          Material List
        </h2>

        {loading ? (
          <p>Loading materials...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Image</th>
                <th>Item ID</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id}>
                  <td>
                    {material.images && material.images.length > 0 ? (
                      <img
                        src={`http://localhost:4000/images/${material.images[0].replace(/\\/g, '/')}`} // Fix image path
                        alt={material.itemName}
                        width="100"
                        height="100"
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td>{material.itemId}</td>
                  <td>{material.itemName}</td>
                  <td>{material.availableQty}</td>
                  <td>${material.unitPrice}</td>
                  <td>
                    <Button variant="primary" className="me-2" onClick={() => handleUpdateOpen(material)}>
                      Update
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(material.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Update Material Modal */}
      {currentMaterial && (
        <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Material</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Item Name</Form.Label>
                <Form.Control type="text" value={currentMaterial.itemName} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Price</Form.Label>
                <Form.Control
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleUpdateSubmit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default MaterialList;

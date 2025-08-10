import './Payment.css'; // Import your CSS styles

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';

const Payment = () => {
  const { enrollmentId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    email: ''
  });

  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      if (!cardComplete) {
        throw new Error('Please complete your card details');
      }

      if (!cardDetails.name.trim() || !cardDetails.email.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Complete enrollment
      await axios.post(
        `http://localhost:4000/api/enrollments/${enrollmentId}/complete`, 
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'token': getAuthToken()
          }
        }
      );
      
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/my-classes'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!state) {
    return (
      <div className="payment-error-container">
        <div className="payment-error-card">
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h3>Invalid Payment Request</h3>
          <p>Please return to the enrollment page and try again.</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Convert amount to number if it's a string
  const amount = typeof state.amount === 'string' 
    ? parseFloat(state.amount) 
    : Number(state.amount);
  
  // Format the amount with 2 decimal places
  const formattedAmount = isNaN(amount) ? '0.00' : amount.toFixed(2);

  return (
    <div className="payment-container">
      <div className="payment-card">
        {/* Header */}
        <div className="payment-header">
          <h2>Complete Enrollment</h2>
          <p>Secure payment processing</p>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <div className="summary-content">
            <h3>Order Summary</h3>
            <div className="summary-details">
              <div className="detail-item">
                <span>Class:</span>
                <strong>{state.className || 'Unknown Class'}</strong>
              </div>
              <div className="detail-item total">
                <span>Total:</span>
                <strong>${formattedAmount}</strong>
              </div>
            </div>
          </div>
        </div>

        {success ? (
          <div className="success-message">
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <h3>Payment Successful!</h3>
            <p>You will be redirected shortly</p>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {/* Payment Form */}
            <div className="payment-form">
              <h3>Payment Information</h3>
              
              <div className="form-group">
                <label>Name on Card</label>
                <div className="input-with-icon">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <input
                    type="text"
                    name="name"
                    value={cardDetails.name}
                    onChange={handleInputChange}
                    placeholder="John Smith"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    value={cardDetails.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Card Details</label>
                <div className="card-element-container">
                  <CardElement 
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#2d3748',
                          fontFamily: '"Inter", sans-serif',
                          '::placeholder': {
                            color: '#a0aec0',
                          },
                        },
                        invalid: {
                          color: '#e53e3e',
                        },
                      },
                    }}
                    onChange={handleCardChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {/* Payment Button */}
            <button 
              onClick={handlePayment}
              disabled={processing || !cardComplete || !cardDetails.name.trim() || !cardDetails.email.trim()}
              className="pay-button"
            >
              {processing ? (
                <>
                  <span className="button-spinner"></span>
                  Processing...
                </>
              ) : (
                `Pay $${formattedAmount}`
              )}
            </button>
            
            {/* Security Footer */}
            <div className="security-footer">
              <div className="security-badge">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11V11.99z"/>
                </svg>
                <span>Secure Payment</span>
              </div>
              <p className="demo-notice">
                This is a demo. Use test card: <strong>4242 4242 4242 4242</strong>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Payment;
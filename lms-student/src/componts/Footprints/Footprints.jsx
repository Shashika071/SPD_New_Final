import "bootstrap/dist/css/bootstrap.min.css";
import './LMSFootprints.css';

import React, { useEffect } from "react";

const Footprints = () => {

  
  // Animation on scroll effect
  useEffect(() => {
    const achievementItems = document.querySelectorAll('.achievement-circle');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.3 });
    
    achievementItems.forEach(item => {
      observer.observe(item);
    });
    
    return () => {
      achievementItems.forEach(item => {
        observer.unobserve(item);
      });
    };
  }, []);

  return (
    <section id="about" className="lms-achievements py-5">
      <div className="container text-center">
        {/* LMS Header */}
        <div className="lms-header mb-5">
          <h1 className="lms-title">
            PHENIX Learning
          </h1>
          <div className="lms-subtitle-container">
            <span className="lms-subtitle-decoration">•</span>
            <p className="lms-subtitle">
              Empowering Minds, Transforming Futures Through Education
            </p>
            <span className="lms-subtitle-decoration">•</span>
          </div>
        </div>
        
        <h6 className="lms-tagline">A Journey of Knowledge and Growth</h6>
        <h2 className="lms-section-title mb-4">
          Our Educational Impact
        </h2>
        
        <div className="row justify-content-center mt-5">
          {/* Experience Circle */}
          <div className="col-md-4 col-sm-6 mb-4">
            <div className="achievement-circle experience-bg">
              <div className="achievement-content">
                <h3 className="achievement-number">10+</h3>
                <p className="achievement-text">Years of Academic Excellence</p>
              </div>
              <div className="achievement-icon">
                <i className="bi bi-mortarboard"></i>
              </div>
            </div>
          </div>
          
          {/* Courses Circle */}
          <div className="col-md-4 col-sm-6 mb-4">
            <div className="achievement-circle courses-bg">
              <div className="achievement-content">
                <h3 className="achievement-number">200+</h3>
                <p className="achievement-text">Courses Offered</p>
              </div>
              <div className="achievement-icon">
                <i className="bi bi-journal-bookmark"></i>
              </div>
            </div>
          </div>
          
          {/* Students Circle */}
          <div className="col-md-4 col-sm-6 mb-4">
            <div className="achievement-circle students-bg">
              <div className="achievement-content">
                <h3 className="achievement-number">50K+</h3>
                <p className="achievement-text">Students Empowered</p>
              </div>
              <div className="achievement-icon">
                <i className="bi bi-people"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="features-section mt-5 mb-4">
          <div className="features-header">
            <span className="features-line"></span>
            <h3 className="features-title">Our Learning Advantages</h3>
            <span className="features-line"></span>
          </div>
          
          <div className="row mt-4">
            <div className="col-md-4 mb-4">
              <div className="feature-item">
                <div className="feature-item-icon">🎓</div>
                <h4 className="feature-item-title">Expert Faculty</h4>
                <p className="feature-item-description">
                  Learn from industry professionals and academic leaders
                </p>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="feature-item">
                <div className="feature-item-icon">💻</div>
                <h4 className="feature-item-title">Flexible Learning</h4>
                <p className="feature-item-description">
                  Access courses anytime, anywhere with our online platform
                </p>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="feature-item">
                <div className="feature-item-icon">🤝</div>
                <h4 className="feature-item-title">Career Support</h4>
                <p className="feature-item-description">
                  Dedicated career services to help you achieve your goals
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enrollment Button */}
        <div className="mt-4 mb-5">
          <button
            className="enrollment-button"
            
          >
            <span className="enrollment-button-icon">📚</span> 
            Enroll Now
          </button>
        </div>

        {/* Testimonial */}
        <div className="testimonial-container">
          <div className="testimonial-quote-mark">"</div>
          <p className="testimonial-text">
            Education is the most powerful weapon which you can use to change the world. 
            At PHENIX, we're committed to providing transformative learning experiences.
          </p>
          <p className="testimonial-author">
            - Dr. Samantha Perera, Academic Director
          </p>
          <div className="testimonial-quote-mark closing-mark">"</div>
        </div>
      </div>
    </section>
  );
};

export default Footprints;
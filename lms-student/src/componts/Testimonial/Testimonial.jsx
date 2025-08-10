import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Testimonial.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Slider from 'react-slick';
import { assest } from '../../assest/assest';

function Testimonial() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 600 && window.innerWidth <= 1100);
  const sliderRef = useRef(null);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 600);
    setIsTablet(window.innerWidth > 600 && window.innerWidth <= 1100);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const cardsData = [
    { 
      image: assest.admin, 
      text: "PHENIX LMS transformed my learning experience. The courses are well-structured and the instructors are knowledgeable.",
      name: "Sarah Johnson", 
      role: "Computer Science Student"
    },
    { 
      image: assest.admin, 
      text: "The platform is intuitive and the content is top-notch. I've significantly improved my skills through their courses.",
      name: "Michael Chen", 
      role: "Business Administration"
    },
    { 
      image: assest.admin, 
      text: "As a working professional, the flexibility of PHENIX LMS allowed me to upskill without compromising my job.",
      name: "Priya Patel", 
      role: "Marketing Professional"
    },
    { 
      image: assest.admin, 
      text: "Teaching on PHENIX LMS has been rewarding. The platform provides excellent tools for engaging with students.",
      name: "Dr. Robert Williams", 
      role: "Professor of Engineering"
    },
  ];

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="testimonial-section" id="testimonials">
      <div
        className="background-image"
        style={{
          backgroundImage: `url(${assest.educationBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />
      <div
        className="overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(25, 60, 100, 0.7)',
          zIndex: 1,
        }}
      />
      <Container style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="testimonial-heading">What Our Students & Faculty Say</h2>
        <p className="testimonial-subheading">Success stories from our learning community</p>
        <Slider ref={sliderRef} {...settings}>
          {cardsData.map((card, idx) => (
            <div key={idx} className="slide">
              <div className="testimonial-card">
                <div className="testimonial-image-container">
                  <img
                    src={card.image}
                    alt={`Testimonial from ${card.name}`}
                    className="testimonial-image"
                  />
                  <div className="quote-icon">“</div>
                </div>
                <div className="testimonial-text">
                  <p className="testimonial-quote">{card.text}</p>
                  <div className="testimonial-author">
                    <h5>{card.name}</h5>
                    <p className="role">{card.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </Container>
    </div>
  );
}

export default Testimonial;

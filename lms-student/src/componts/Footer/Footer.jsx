import "./Footer.css";

import { Button, Col, Container, Row } from "react-bootstrap";
import { FaArrowUp, FaAward, FaBookOpen, FaEnvelope, FaFacebookF, FaGraduationCap, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaTwitter, FaUsers } from "react-icons/fa";

import React from "react";
import { assest } from "../../assest/assest";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "#home", icon: <FaGraduationCap className="me-2" /> },
    { name: "Courses", href: "#courses", icon: <FaBookOpen className="me-2" /> },
    { name: "Faculty", href: "#faculty", icon: <FaUsers className="me-2" /> },
    { name: "About Us", href: "#about", icon: <FaAward className="me-2" /> },
    { name: "Contact", href: "#contact", icon: <FaEnvelope className="me-2" /> }
  ];

  const socialLinks = [
    { 
      name: "Facebook", 
      href: "https://www.facebook.com/", 
      icon: <FaFacebookF />,
      color: "facebook"
    },
    { 
      name: "Twitter", 
      href: "https://twitter.com/", 
      icon: <FaTwitter />,
      color: "twitter"
    },
    { 
      name: "LinkedIn", 
      href: "https://linkedin.com/", 
      icon: <FaLinkedinIn />,
      color: "linkedin"
    },
    { 
      name: "Instagram", 
      href: "https://instagram.com/", 
      icon: <FaInstagram />,
      color: "instagram"
    }
  ];

  const contactInfo = [
    {
      icon: <FaPhone className="contact-icon" />,
      title: "Call Us",
      content: (
        <div>
          <a href="tel:+94714032456" className="contact-link">
            +94 71 403 2456 <span className="text-muted small">(Admissions)</span>
          </a>
          <br />
          <a href="tel:+94775734895" className="contact-link">
            +94 77 573 4895 <span className="text-muted small">(Support)</span>
          </a>
        </div>
      )
    },
    {
      icon: <FaEnvelope className="contact-icon" />,
      title: "Email Us",
      content: (
        <div>
          <a href="mailto:info@phenixlms.edu" className="contact-link">
            info@phenixlms.edu
          </a>
          <br />
          <a href="mailto:support@phenixlms.edu" className="contact-link">
            support@phenixlms.edu
          </a>
        </div>
      )
    },
    {
      icon: <FaMapMarkerAlt className="contact-icon" />,
      title: "Visit Us",
      content: (
        <div className="contact-address">
          123 Education Avenue,<br />
          Colombo 07,<br />
          Sri Lanka 00700
        </div>
      )
    }
  ];

  return (
    <footer className="footer" id="footer">
      <Container>
        {/* Main Footer Content */}
        <Row className="footer-main py-5">
          {/* Company Information */}
          <Col lg={4} md={6} className="mb-4">
            <div className="footer-brand">
              <img 
                src={assest.expo} 
                alt="PHENIX LMS Logo" 
                className="footer-logo mb-3"
              />
              <h5 className="brand-name mb-3">PHENIX LMS</h5>
              <p className="footer-description">
                Empowering learners through innovative education. PHENIX LMS provides 
                quality online learning resources, expert instruction, and cutting-edge 
                technology to help you achieve your academic and professional goals.
              </p>
              
              {/* Social Media Links */}
              <div className="footer-social-icons mt-4">
                <h6 className="social-title mb-3">Follow Us</h6>
                <div className="social-buttons">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`social-btn social-btn-${social.color}`}
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={3} sm={6} className="mb-4">
            <div className="footer-section">
              <h6 className="footer-title">Quick Links</h6>
              <ul className="footer-links">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.icon}
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Col>

          {/* Resources */}
          <Col lg={2} md={3} sm={6} className="mb-4">
            <div className="footer-section">
              <h6 className="footer-title">Resources</h6>
              <ul className="footer-links">
                <li><a href="#help" className="footer-link">Help Center</a></li>
                <li><a href="#tutorials" className="footer-link">Tutorials</a></li>
                <li><a href="#blog" className="footer-link">Blog</a></li>
                <li><a href="#webinars" className="footer-link">Webinars</a></li>
                <li><a href="#downloads" className="footer-link">Downloads</a></li>
              </ul>
            </div>
          </Col>

          {/* Contact Information */}
          <Col lg={4} md={12} className="mb-4">
            <div className="footer-section">
              <h6 className="footer-title">Contact Information</h6>
              <div className="contact-info">
                {contactInfo.map((info, index) => (
                  <div key={index} className="contact-item">
                    <div className="contact-icon-wrapper">
                      {info.icon}
                    </div>
                    <div className="contact-details">
                      <h6 className="contact-title">{info.title}</h6>
                      <div className="contact-content">
                        {info.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        {/* Newsletter Subscription */}
        <Row className="newsletter-section py-4">
          <Col lg={8} md={12}>
            <div className="newsletter-content">
              <h5 className="newsletter-title">Stay Updated</h5>
              <p className="newsletter-description">
                Subscribe to our newsletter for the latest courses, updates, and educational insights.
              </p>
            </div>
          </Col>
          <Col lg={4} md={12}>
            <div className="newsletter-form">
              <div className="input-group">
                <input 
                  type="email" 
                  className="form-control newsletter-input" 
                  placeholder="Enter your email"
                  aria-label="Email address"
                />
                <Button variant="primary" className="newsletter-btn">
                  Subscribe
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Footer Bottom */}
        <Row className="footer-bottom py-4">
          <Col md={6} className="text-center text-md-start">
            <p className="copyright-text mb-0">
              © {currentYear} PHENIX Learning Management System™. All Rights Reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="footer-bottom-links">
              <a href="#privacy" className="footer-bottom-link">Privacy Policy</a>
              <span className="divider">|</span>
              <a href="#terms" className="footer-bottom-link">Terms of Service</a>
              <span className="divider">|</span>
              <a href="#cookies" className="footer-bottom-link">Cookie Policy</a>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Back to Top Button */}
      <Button
        variant="primary"
        className="back-to-top-btn"
        onClick={scrollToTop}
        title="Back to Top"
      >
        <FaArrowUp />
      </Button>
    </footer>
  );
};

export default Footer;
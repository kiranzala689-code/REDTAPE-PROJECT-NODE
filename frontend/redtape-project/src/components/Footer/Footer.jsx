import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";
import "./Footer.css";

function Footer() {
    return (
        <footer className="redtape-footer">
            <div className="redtape-footer-container">
                <div className="redtape-footer-grid">
                    <div className="redtape-footer-column customer-service">
                        <h3>Customer Service</h3>
                        <p className="footer-label">09:30 A.M. to 05:00 P.M</p>

                        <h4>Call Us</h4>
                        <a href="tel:+917836850000">+91 7836850000</a>

                        <h4>Get in Touch</h4>
                        <a href="mailto:customercare@redtapeindia.com">
                            customercare@redtapeindia.com
                        </a>
                    </div>

                    <div className="redtape-footer-column">
                        <h3>Collection</h3>
                        <Link to="/category/men">Men</Link>
                        <Link to="/category/women">Women</Link>
                        <Link to="/category/accessories">Accessories</Link>
                        <Link to="/category/ozark">Ozark</Link>
                    </div>

                    <div className="redtape-footer-column">
                        <h3>Get Help</h3>
                        <Link to="/">About Us</Link>
                        <Link to="/">Contact Us</Link>
                        <Link to="/login">My Account</Link>
                        <Link to="/">Store Locator</Link>
                        <Link to="/">Store Expansion</Link>
                        <Link to="/">FAQs</Link>
                    </div>

                    <div className="redtape-footer-column">
                        <h3>Company</h3>
                        <Link to="/">Return &amp; Replacing</Link>
                        <Link to="/">Privacy Policy</Link>
                        <Link to="/">Terms &amp; Conditions</Link>
                    </div>

                    <div className="redtape-footer-column about-redtape">
                        <h3>About Redtape</h3>
                        <p>
                            RedTape is known for emerging as one of the Finest Brands of
                            Footwear and Clothing for Men, Women and Kids. It has emerged as
                            a complete Family Fashion Destination by providing the Best
                            International Styles and World-Class Quality through Shoes,
                            Apparels and Accessories for all age groups. We own a Portfolio
                            of Well-Recognized Brands:
                        </p>
                        <Link className="read-more" to="/">Read More</Link>
                    </div>
                </div>

                <div className="redtape-footer-social">
                    <div className="footer-social-line" />
                    <div className="footer-social-icons">
                        <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
                            <FaFacebookF />
                        </a>
                        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
                            <FaInstagram />
                        </a>
                        <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube">
                            <FaYoutube />
                        </a>
                        <a href="https://twitter.com/" target="_blank" rel="noreferrer" aria-label="Twitter">
                            <FaTwitter />
                        </a>
                    </div>
                    <div className="footer-social-line" />
                </div>

                <div className="redtape-footer-bottom">
                    <p>© 2026 The content of this site is copyright-protected and is the property of RedTape.</p>
                    <div className="footer-bottom-links">
                        <Link to="/">Privacy Policy</Link>
                        <Link to="/">Terms &amp; Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

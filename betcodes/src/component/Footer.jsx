import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container full-width">
        <p className="footer-title"> Bet24 made Designed for gaming prupose</p>
        <p className="footer-text">
          Bet24 is your go-to platform for online betting & gaming, offering exciting games and secure transactions.
        </p>
        <div className="footer-links">
          <a href="https://www.linkedin.com/in/alok-shukla-73357928a" target="blank" className="footer-link">Linkedin</a>
          <a href="https://github.com/ShuklAlok2545" target="blank" className="footer-link">Github</a>
          
        </div>
        <p className="footer-copyright">&copy; {new Date().getFullYear()}Bet24. All rights reserved. </p>
      </div>
    </footer>
  );
};

export default Footer;

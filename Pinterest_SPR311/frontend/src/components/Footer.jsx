import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="inspira-footer">
      <div className="faq-section">
        <h2>Поширені запитання</h2>
        <ul>
          <li>
            <Link to="/settings/help">Як створити обліковий запис?</Link>
          </li>
          <li>
            <Link to="/settings/help">Як змінити пароль?</Link>
          </li>
          <li>
            <Link to="/settings/help">Що робити, якщо не вдається увійти?</Link>
          </li>
          <li>
            <Link to="/settings/help">Як зв'язатися зі службою підтримки?</Link>
          </li>
        </ul>
      </div>
      <div className="footer-links">
        <Link to="/settings/help">Допомога</Link>
        <Link to="/settings/privacy">Конфіденційність</Link>
        <Link to="/settings/security">Безпека</Link>
      </div>
      <div className="copyright">
        © 2026 Inspira Clone. Всі права захищені.
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-col">
            <h4>Розыгрыши</h4>
            <Link to="/">Главная</Link>
            <Link to="/rules">Правила</Link>
            <Link to="/winners">Победители</Link>
          </div>
          <div className="footer-col">
            <h4>О сервисе</h4>
            <Link to="/about">О проекте</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/contacts">Контакты</Link>
          </div>
          <div className="footer-col">
            <h4>Мы в соцсетях</h4>
            <a href="https://vk.ru/club238936337" target="_blank" rel="noopener noreferrer">ВКонтакте</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Сервис онлайн-розыгрышей. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
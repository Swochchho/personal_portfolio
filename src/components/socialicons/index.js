import React from 'react';
import { useContent } from '../../context/ContentContext';
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaFacebook,
  FaInstagram 
} from 'react-icons/fa';
import './style.css';

const Socialicons = () => {
  const { content } = useContent();

  return (
    <div className="social-icons">
      {content?.socialprofils?.github && (
        <a href={content.socialprofils.github} target="_blank" rel="noopener noreferrer">
          <FaGithub className="icon" />
        </a>
      )}
      {content?.socialprofils?.linkedin && (
        <a href={content.socialprofils.linkedin} target="_blank" rel="noopener noreferrer">
          <FaLinkedin className="icon" />
        </a>
      )}
      {content?.socialprofils?.twitter && (
        <a href={content.socialprofils.twitter} target="_blank" rel="noopener noreferrer">
          <FaTwitter className="icon" />
        </a>
      )}
      {content?.socialprofils?.facebook && (
        <a href={content.socialprofils.facebook} target="_blank" rel="noopener noreferrer">
          <FaFacebook className="icon" />
        </a>
      )}
      {content?.socialprofils?.instagram && (
        <a href={content.socialprofils.instagram} target="_blank" rel="noopener noreferrer">
          <FaInstagram className="icon" />
        </a>
      )}
    </div>
  );
};

export default Socialicons;
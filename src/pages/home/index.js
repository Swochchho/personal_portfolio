import React from 'react';
import { useContent } from '../../context/ContentContext';
import './style.css'; // Your original home styles
import { TypeAnimation } from 'react-type-animation'; // If you were using typing animation
import { FaArrowDown } from 'react-icons/fa'; // Example icon import

const Home = () => {
  const { content, loading } = useContent();

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <section className="section home-section">
        <div className="container">
          {/* Main Title */}
          <h1 className="home-title">
            {content?.introdata?.title || "I'm John Doe"}
          </h1>
          
          {/* Animated Text - using your original animation */}
          <div className="home-animated-text">
            {content?.introdata?.animated ? (
              <TypeAnimation
                sequence={content.introdata.animated.flatMap(text => [text, 1500])}
                wrapper="span"
                speed={50}
                style={{ display: 'inline-block' }}
                repeat={Infinity}
              />
            ) : (
              <span>Full Stack Developer</span>
            )}
          </div>
          
          {/* Description */}
          <p className="home-description">
            {content?.introdata?.description || 
             "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
          </p>
          
          {/* Profile Image */}
          <div className="home-image-container">
            <img 
              src={content?.introdata?.your_img_url || "https://via.placeholder.com/400"} 
              alt="Profile" 
              className="home-image"
            />
          </div>
          
          {/* Scroll Down Indicator */}
          <div className="scroll-down">
            <FaArrowDown className="bounce" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
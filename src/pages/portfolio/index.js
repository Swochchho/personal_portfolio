import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useContent } from '../../context/ContentContext';
import './style.css';

const Portfolio = () => {
  const { content } = useContent();

  return (
    <div className="main-content">
      <section className="section portfolio-section">
        <Container>
          <Row className="mb-5">
            <Col lg="8">
              <h1 className="display-4 mb-4">My Portfolio</h1>
              <hr className="t_border my-4 ml-0 text-left" />
            </Col>
          </Row>
          <Row className="portfolio-items">
            {content?.dataportfolio?.map((item, index) => (
              <Col key={index} lg="4" md="6" className="mb-5">
                <div className="portfolio-item">
                  <div className="portfolio-img">
                    <img 
                      src={item.img || "https://via.placeholder.com/400"} 
                      alt={item.description} 
                      className="img-fluid"
                    />
                    <div className="portfolio-overlay">
                      <div className="portfolio-info">
                        <h5>{item.description || "Project Title"}</h5>
                        <a 
                          href={item.link || "#"} 
                          className="btn btn-sm btn-outline-light"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Project
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Portfolio;
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useContent } from '../../context/ContentContext';
import './style.css';

const About = () => {
  const { content } = useContent();

  return (
    <div className="main-content">
      <section className="section about-section">
        <Container>
          <Row className="mb-5">
            <Col lg="8">
              <h1 className="display-4 mb-4">About Me</h1>
              <hr className="t_border my-4 ml-0 text-left" />
            </Col>
          </Row>
          <Row className="sec_sp">
            <Col lg="5" className="mb-5">
              <h3 className="color_sec py-4">{content?.dataabout?.title || "A bit about myself"}</h3>
              <div className="about-desc">
                <p>{content?.dataabout?.aboutme || "Loading description..."}</p>
              </div>
            </Col>
            <Col lg="7" className="d-flex align-items-center">
              <div className="about-skills">
                <h3 className="mb-4">Skills</h3>
                <div className="skills-container">
                  {content?.skills?.map((skill, index) => (
                    <div key={index} className="skill-item mb-3">
                      <div className="d-flex justify-content-between">
                        <span>{skill.name}</span>
                        <span>{skill.value}%</span>
                      </div>
                      <div className="progress">
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${skill.value}%` }}
                          aria-valuenow={skill.value}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default About;
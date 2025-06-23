import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { useContent } from "../../context/ContentContext";
import "./style.css";

export const Portfolio = () => {
  const { content, meta } = useContent();

  return (
    <HelmetProvider>
      <Container className="About-header mt-5 h-auto">
        <Helmet>
          <meta charSet="utf-8" />
          <title> Portfolio | {meta?.title || "Portfolio"} </title>
          <meta name="description" content={meta?.description || ""} />
        </Helmet>
        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4">Portfolio</h1>
            <hr className="t_border my-4 ml-0 text-left" />
          </Col>
        </Row>
        <div className="mb-5 po_items_ho">
          {content?.dataportfolio?.map((data, i) => {
            return (
              <div key={i} className="po_item">
                <img src={data.img || "https://via.placeholder.com/400"} alt={data.description} />
                <div className="content">
                  <p>{data.description || "Project description"}</p>
                  <a 
                    href={data.link || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    view project
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </HelmetProvider>
  );
};

export default Portfolio;
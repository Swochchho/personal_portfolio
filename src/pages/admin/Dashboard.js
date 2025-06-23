import React, { useState, useEffect, useContext } from 'react';
import { Tabs, Tab, Form, Button, Alert, Accordion } from 'react-bootstrap';
import { FiSave, FiLogOut, FiPlus, FiTrash2 } from 'react-icons/fi';
import AuthContext from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import './style.css';

const AdminDashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { content, loading, error, updateContent } = useContent();
  const [localContent, setLocalContent] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (content) {
      setLocalContent(JSON.parse(JSON.stringify(content)));
    }
  }, [content]);

  const handleChange = (path, value) => {
    setLocalContent(prev => {
      const newContent = { ...prev };
      const keys = path.split('.');
      let current = newContent;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newContent;
    });
  };

  const handleArrayChange = (path, index, field, value) => {
    setLocalContent(prev => {
      const newContent = { ...prev };
      const arr = path.split('.').reduce((obj, key) => obj[key], newContent);
      arr[index][field] = value;
      return newContent;
    });
  };

  const addArrayItem = (path, template) => {
    setLocalContent(prev => {
      const newContent = { ...prev };
      const arr = path.split('.').reduce((obj, key) => obj[key], newContent);
      arr.push({ ...template });
      return newContent;
    });
  };

  const removeArrayItem = (path, index) => {
    setLocalContent(prev => {
      const newContent = { ...prev };
      const arr = path.split('.').reduce((obj, key) => obj[key], newContent);
      arr.splice(index, 1);
      return newContent;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateContent(localContent);
    setSaveStatus(result.success ? 'success' : 'error');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  if (loading || !localContent) return (
    <div className="admin-section">
      <div className="admin-container text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="admin-section">
      <div className="admin-container">
        <Alert variant="danger">Error loading content: {error}</Alert>
      </div>
    </div>
  );

  return (
    <div className="admin-section">
      <div className="admin-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Content Management</h1>
          <div>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              className="me-2 btn-admin"
            >
              <FiSave className="me-1" /> Save
            </Button>
            <Button 
              variant="danger" 
              onClick={logoutUser}
              className="btn-admin"
            >
              <FiLogOut className="me-1" /> Logout
            </Button>
          </div>
        </div>

        {saveStatus === 'success' && (
          <Alert variant="success" className="mb-4">
            Content saved successfully!
          </Alert>
        )}
        {saveStatus === 'error' && (
          <Alert variant="danger" className="mb-4">
            Failed to save content
          </Alert>
        )}

        <Tabs defaultActiveKey="meta" className="mb-4">
          <Tab eventKey="meta" title="Meta Data">
            <div className="admin-card">
              <h3 className="mb-4">Site Information</h3>
              <Form.Group className="mb-3">
                <Form.Label>Site Title</Form.Label>
                <Form.Control 
                  type="text" 
                  value={localContent.meta?.title || ''}
                  onChange={(e) => handleChange('meta.title', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Site Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  value={localContent.meta?.description || ''}
                  onChange={(e) => handleChange('meta.description', e.target.value)}
                />
              </Form.Group>
            </div>
          </Tab>

          <Tab eventKey="portfolio" title="Portfolio">
            <div className="admin-card">
              <div className="d-flex justify-content-between mb-4">
                <h3>Portfolio Items</h3>
                <Button 
                  variant="success" 
                  onClick={() => addArrayItem('dataportfolio', {
                    img: '',
                    description: '',
                    link: '#'
                  })}
                  className="btn-admin"
                >
                  <FiPlus className="me-1" /> Add Item
                </Button>
              </div>

              <Accordion>
                {localContent.dataportfolio?.map((item, index) => (
                  <Accordion.Item key={index} eventKey={index.toString()}>
                    <Accordion.Header>
                      Portfolio Item #{index + 1}
                    </Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={item.img}
                          onChange={(e) => handleArrayChange(
                            'dataportfolio', 
                            index, 
                            'img', 
                            e.target.value
                          )}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleArrayChange(
                            'dataportfolio', 
                            index, 
                            'description', 
                            e.target.value
                          )}
                        />
                      </Form.Group>
                      <Button 
                        variant="outline-danger"
                        onClick={() => removeArrayItem('dataportfolio', index)}
                      >
                        <FiTrash2 className="me-1" /> Remove
                      </Button>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
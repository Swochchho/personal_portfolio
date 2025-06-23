import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    try {
      const res = await axios.get('/api/content');
      setContent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (updatedContent) => {
    try {
      const res = await axios.put('/api/content', updatedContent);
      setContent(res.data);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Update failed' 
      };
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <ContentContext.Provider value={{ 
      content, 
      loading, 
      error,
      updateContent,
      refreshContent: fetchContent
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
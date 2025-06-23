import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        const res = await axios.get('/api/contact', config);
        setMessages(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err.response.data);
      }
    };
    
    fetchMessages();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location = '/login';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Messages</h2>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
      
      <div className="messages-list">
        {messages.map(message => (
          <div key={message._id} className="message-card">
            <h4>{message.name}</h4>
            <p>{message.email}</p>
            <p>{message.message}</p>
            <small>{new Date(message.date).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
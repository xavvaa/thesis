import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Dashboard', subtitle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className={`${styles.mainContent} ${!isSidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <Header 
          onMenuClick={toggleSidebar} 
          title={title} 
          subtitle={subtitle} 
        />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

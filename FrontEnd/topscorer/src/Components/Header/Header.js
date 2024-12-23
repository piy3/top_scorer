import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import icons from '../../Project_Icon/Dark.png';
import { IoExitOutline } from "react-icons/io5";
import toast from 'react-hot-toast';

function Header({ islogin ,setislogin}) {
  const navigate = useNavigate();
  const [isUser, setIsUser] = useState('');

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    // Clear the access token and other user data on logout
    localStorage.removeItem('accessToken');
    setIsUser('');
    setislogin(false);

    // Trigger a toast notification for logout process
    toast.promise(
      // Here, we'll simulate a promise (you can replace this with actual logout logic)
      Promise.resolve(),
      {
        loading: 'Logging Out...',
        success: <b>See you soon!</b>,
        error: <b>Logout failed. Please try again.</b> // In case of error
      }
    );

    // Navigate to the home page after logout
    navigate('/');
  };

  useEffect(() => {
    const acToken = localStorage.getItem('accessToken');
    if (acToken) {
      const payload = acToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      if (decodedPayload.username) {
        setIsUser(decodedPayload.username);
      }
    } else {
      console.log('No acToken found in localStorage');
    }
  }, [islogin]);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img className={styles.logo} src={icons} alt="Dark Icon" />
      </div>
      <nav className={styles.nav}>
        <a href="/" className={styles.navLink}>Home</a>
        {/* <a href="/chat" className={styles.navLink}>Chat</a> */}
        
        {isUser !== '' ? (
          <div className={styles.userContainer}>
            <span className={styles.username}>{isUser}</span>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <IoExitOutline className={styles.logoutIcon} />
            </button>
          </div>
        ) : (
          <button className={styles.login} onClick={handleLoginClick}>Login</button>
        )}
      </nav>
    </header>
  );
}

export default Header;

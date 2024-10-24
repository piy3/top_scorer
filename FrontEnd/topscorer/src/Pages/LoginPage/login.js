import React from 'react';
import style from '../LoginPage/login.module.css';
import { FaGoogle } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { Link } from 'react-router-dom'; // Ensure to import Link from react-router-dom

function Login() {
  return (
    <>
      <div className={style.f_div}>
        <div className={style.image}>
          <img 
            src="https://e0.pxfuel.com/wallpapers/649/530/desktop-wallpaper-cricket-cricket-iphone.jpg" 
            alt="Cricket"
          />
          <div className={style.gradient}></div> 

          <div className={style.quote}>Live The Spirit</div> 
        </div>

        <div className={style.main2}>
          <h1>Join Us!</h1>
          <div className={style.inner}>
            <form>
              <input 
                className={style.inp2} 
                type='text' 
                placeholder='Username or Email'
              />

              <input 
                className={style.inp2} 
                type="password" 
                placeholder='Password or OTP'
              />

              <input 
                className={style.sb_btn}
                type='submit' 
                value='Login'
              />
            </form>
            <div className={style.icon_c}>
              <div className={style.icon}> <FaGoogle className={style.ic}/></div>
              <div className={style.icon}><FaFacebook className={style.ic} /></div>
              <div className={style.icon}><FaLinkedin className={style.ic} /></div>
            </div>
            <div className={style.terms}>
              <p className={style.termsText}>
                By logging in, you agree to our <Link to="/tnc" className={style.termsLink}>Terms and Conditions</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;

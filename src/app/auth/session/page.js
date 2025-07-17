"use client"; 
import React from 'react';
import styles from "../session/page.module.css"; 

export default function Login() {
  return (
    <>
      <div className={styles.container}>

        <main className={styles.loginWrapper}>
          <div className={styles.loginContainer}>
            <form action="/shops" method="post" className={styles.loginForm}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="id"
                  id="id"
                  placeholder="아이디"
                  required
                  className={styles.input}
                />
              </div>

              {/* Password input group */}
              <div className={styles.loginForm}>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="비밀번호"
                  required
                  className={styles.input}
                />
              </div>

              {/* Error message display (will be dynamic in a real app) */}
              <div id="error" className={`${styles.errorMessage} hidden`}>
                <span></span>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className={styles.loginButton}
              >
                LOGIN
              </button>

              {/* Login links (회원가입, 아이디 찾기, 비밀번호 찾기) */}
              <div className={styles.loginLinks}>
                <a href="/auth/signup" className={styles.link}>회원가입</a>
                <span className={styles.separator}>|</span>
                <a href="/auth/id-retrieval" className={styles.link}>아이디 찾기</a>
                <span className={styles.separator}>|</span>
                <a href="/auth/password-reset" className={styles.link}>비밀번호 찾기</a>
              </div>
            </form>
          </div>
        </main>

        {/* Footer section */}
        <footer className={styles.footer}>
        </footer>
      </div>
    </>
  );
}
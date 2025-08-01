'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./page.module.css";

export default function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:8080/auth/session'
        , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 백엔드 LoginUserDTO의 필드명에 맞게 'userId', 'userPwd' 사용
        body: JSON.stringify({ userId: id, userPwd: password }),
      });

      // if (response.ok) {
      //   const responseData = await response.json(); // 응답 본문 파싱

      if (response.ok) {
            const responseData = await response.json();
                        console.log(" 서버로부터 받은 전체 응답 데이터: ", responseData);
            console.log(" responseData.data 객체: ", responseData.data);
            if (responseData.data) {
                console.log(" responseData.data.accessToken 필드: ", responseData.data.accessToken);
            }
        if (responseData.data && responseData.data.accessToken) { // TokenDTO의 accessToken 필드 확인
          const token = responseData.data.accessToken;
          localStorage.setItem('token', token);
          console.log('로그인 성공! 토큰 저장됨:', token);

          if (responseData.data.userId) { // TokenDTO에 userId 필드가 있다면
          localStorage.setItem('userId', responseData.data.userId); // userId를 localStorage에 저장
          console.log('로그인된 사용자 ID 저장됨:', responseData.data.userId);
        }
          router.push('/shops'); // 로그인 성공 후 이동할 페이지
        } else {
          setErrorMessage('로그인에 성공했지만, 서버 응답에서 토큰을 찾을 수 없습니다.');
          console.error('로그인 응답 형식 문제:', responseData);
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || '로그인 실패: 아이디 또는 비밀번호를 확인해주세요.');
        console.error('로그인 실패 응답:', response.status, errorData);
        window.alert("로그인에 실패하였습니다. 알맞은 아이디와 비밀번호를 입력하였는지 확인해주세요.");
      }
    } catch (error) {
      setErrorMessage('네트워크 오류 또는 서버에 연결할 수 없습니다.');
      console.error('로그인 요청 중 오류 발생:', error);
      window.alert("네트워크 오류 또는 서버에 연결할 수 없습니다.")
    }
  };

  return (
    <>
      <div className={styles.container}>
        <main className={styles.loginWrapper}>
          <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="userId"
                  id="userId"
                  placeholder="아이디"
                  required
                  className={styles.input}
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="userPwd"
                  id="userPwd"
                  placeholder="비밀번호"
                  required
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div id="error" className={`${styles.errorMessage} ${errorMessage ? '' : 'hidden'}`}>
                <span>{errorMessage}</span>
              </div>

              <button
                type="submit"
                className={styles.loginButton}
              >
                LOGIN
              </button>

              <div className={styles.loginLinks}>
                <a href="/auth/users" className={styles.link}>회원가입</a>
                <span className={styles.separator}>|</span>
                <a href="/auth/id-retrieval" className={styles.link}>아이디 찾기</a>
                <span className={styles.separator}>|</span>
                <a href="/auth/password-reset" className={styles.link}>비밀번호 찾기</a>
              </div>
            </form>
          </div>
        </main>

        <footer className={styles.footer}>
        </footer>
      </div>
    </>
  );
}
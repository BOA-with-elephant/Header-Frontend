"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import styles from "../users/page.module.css"; 

function Checkbox({ children, disabled, checked, onChange }) {
  return (
    <label>
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={({ target: { checked } }) => onChange(checked)}
      />
      {children}
    </label>
  );
}

export default function Signup() {
    const [service, setService] = React.useState(false);
    const [marketing, setMarketing] = React.useState(false);
    // State to manage form input values
    const [formData, setFormData] = useState({
        userName: '',
        userPhone: '',
        userId: '',
        userPwd: '',
        birthday: '',
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    //백엔드로 전송되는 데이터 확인
     console.log('Form submitted with data:', formData);

        try {
            const response = await fetch('http://localhost:8080/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // Handle successful signup (e.g., redirect, show success message)
                console.log('Signup successful!');
                alert('회원가입이 성공적으로 완료되었습니다!');
                window.location.href = '/auth/session';
            } else {
                // Handle errors (e.g., show error message)
                const errorData = await response.json();
                console.error('Signup failed:', errorData);
                alert(`회원가입 실패: ${errorData.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div className={styles.mainContent}>
            <div className={styles.contentCard}>
                <h2>회원 정보 수정</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="userName">이름:</label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="userPhone">전화번호:</label>
                        <input
                            type="tel"
                            id="userPhone"
                            name="userPhone"
                            value={formData.userPhone}
                            onChange={handleChange}
                            placeholder="예: 010-1234-5678"
                            pattern="[0-9]{3}-?[0-9]{4}-?[0-9]{4}"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="userPwd">비밀번호:</label>
                        <input
                            type="password"
                            id="userPwd"
                            name="userPwd"
                            value={formData.userPwd}
                            onChange={handleChange}
                            minLength="6" // 비밀번호 최소 길이
                            required
                        />
                    </div>

                    <br/>
                    <button
                        type="submit"
                        className={styles.loginButton}
                    >
                        정보 수정
                    </button>                        
                </form>
                <button>
                        <Link href="/auth/{user_id}/leave">
                        회원탈퇴
                        </Link>    
                    </button> 
            </div>
        </div>
    );
}
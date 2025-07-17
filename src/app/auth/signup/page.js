"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import styles from "../signup/page.module.css"; 

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
        e.preventDefault(); // Prevent default browser form submission

        // You would typically send this data to your backend
        console.log('Form submitted with data:', formData);

        try {
            const response = await fetch('/auth/signup', {
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
                // Example: Redirect to a login page
                // window.location.href = '/login';
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
        <div className="signup-container"> {/* Added a container for overall styling */}
            <h1>회원가입 페이지</h1>
            <div className="content-card">
                <form onSubmit={handleSubmit}> {/* Use onSubmit for React forms */}
                    <div className="form-group">
                        <label htmlFor="userName">이름:</label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            required // Add HTML5 validation
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="userPhone">전화번호:</label>
                        <input
                            type="tel"
                            id="userPhone"
                            name="userPhone"
                            value={formData.userPhone}
                            onChange={handleChange}
                            placeholder="예: 010-1234-5678"
                            pattern="[0-9]{3}-?[0-9]{4}-?[0-9]{4}" // Basic pattern for phone number
                            required
                        />
                        <button type="submit">
                            <Link href="/auth/verification-code">전화번호 인증</Link>
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="userId">아이디:</label>
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}                        
                            minLength="4" // Example: Minimum length for ID
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="userPwd">비밀번호:</label>
                        <input
                            type="password"
                            id="userPwd"
                            name="userPwd"
                            value={formData.userPwd}
                            onChange={handleChange}
                            minLength="6" // Example: Minimum length for password
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="birthday">생년월일:</label>
                        <input
                            type="date"
                            id="birthday"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                        />
                    </div>

                    {/*회원가입 약관 체크*/}
                    <Checkbox checked={service} onChange={setService}>
                            (필수) 서비스 이용약관
                    </Checkbox>
                    <a class={styles.linkStyle} href="/auth/terms-of-use">
                        이용약관 보기
                    </a>
                    <br/>
                    <Checkbox checked={marketing} onChange={setMarketing}>
                        (선택) 마케팅 수신
                    </Checkbox>
                    <br/>
                    <button type="submit">회원가입</button>
                </form>
            </div>
        </div>
    );
}
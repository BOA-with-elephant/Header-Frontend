"use client";
import React, { useState } from 'react';

export default function validateOX() {
    // State to manage form input values
    const [formData, setFormData] = useState({
        userName: '',
        userPhone: ''
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

        // 백엔드로 넘어가는 데이터 확인을 위한 코드
        console.log('Form submitted with data:', formData);

        try {
            const response = await fetch('/auth/verification-code/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // Handle successful signup (e.g., redirect, show success message)
                console.log('Verify successful');
                alert('전화번호 인증에 성공하였습니다!');
                // 성공 시 회원가입 페이지로 전환
                window.location.href = '/auth/verification-code';
            } else {
                // Handle errors (e.g., show error message)
                const errorData = await response.json();
                console.error('Verify failed:', errorData);
                alert(`전화번호 인증 실패: ${errorData.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Error during verify phone:', error);
            alert('전화번호 인증 절차 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

   return (
        <div className="signup-container">
            <h1>인증번호 확인</h1>
            <div className="content-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="verifyCode">인증번호:</label>
                        <input
                            type="text"
                            id="verifyCode"
                            name="verifyCode"
                            value={formData.verifyCode}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">인증번호 확인</button>
                </form>
            </div>
        </div>
    );
}
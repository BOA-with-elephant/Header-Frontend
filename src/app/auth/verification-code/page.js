"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Signup from "@/app/auth/users/page.js";

export default function Verification() {
    const { userName, userPhone } = Signup();
    const [formData, setFormData] = useState({
        userName: {userName},
        userPhone: {userPhone}
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
                const response = await fetch('/auth/verification-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
    
                if (response.ok) {
                    // Handle successful signup (e.g., redirect, show success message)
                    console.log('Verify successful');
                    alert('회원가입에 성공하였습니다!');
                    // 성공 시 로그인 페이지로 전환
                    window.location.href = '/auth/session';
                } else {
                    // Handle errors (e.g., show error message)
                    const errorData = await response.json();
                    console.error('Verify failed:', errorData);
                    alert(`회원가입 실패: ${errorData.message || '알 수 없는 오류'}`);
                }
            } catch (error) {
                console.error('Error during verify phone:', error);
                alert('회원가입 절차 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        };
    return (
        <div className="signup-container"> {/* Added a container for overall styling */}
            <h1>전화번호 인증</h1>
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
                            required
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
                            pattern="[0-9]{3}-?[0-9]{4}-?[0-9]{4}"
                            required
                        />
                    </div>

                    <button type="submit">
                        <Link href="/auth/verification-code/validate">인증번호 발송</Link>
                    </button>
                </form>
            </div>
        </div>
    );
}
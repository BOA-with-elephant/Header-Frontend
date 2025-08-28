"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Signup from "@/app/auth/users/page.js";

export default function Verification() {
    const { userId, userEmail } = Signup();
    const [formData, setFormData] = useState({
        userId: {userId},
        userEmail: {userEmail}
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
                        'Content-Type': 'application/json; charset=UTF-8',
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
            <h1>본인 인증</h1>
            <div className="content-card">
                <form onSubmit={handleSubmit}> {/* Use onSubmit for React forms */}
                    <div className="form-group">
                        <label htmlFor="userName">아이디:</label>
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="userEmail">이메일:</label>
                        <input
                            type="tel"
                            id="userEmail"
                            name="userEmail"
                            value={formData.userEmail}
                            onChange={handleChange}
                            placeholder="예: example@site.com"
                            pattern="/^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+/"
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
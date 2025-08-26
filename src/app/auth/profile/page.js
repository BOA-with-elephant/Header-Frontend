"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import styles from "../users/page.module.css";
import {useRouter} from "next/navigation.js";

export default function UpdateProfile() {
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [userPwd, setUserPwd] = useState('');
    const router = useRouter();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        //백엔드로 데이터 정상 전송되는지 확인
        console.log('프로필 수정사항 정상 전송');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
            //const response = await fetch('http://localhost:8080/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify((() => {
                    const payload = { userId: localStorage.getItem('userId') };
                    if (userName?.trim()) payload.userName = userName.trim();
                    if (userPhone?.trim()) payload.userPhone = userPhone.trim();
                    if (userPwd) payload.userPwd = userPwd;
                    return payload;
                })()),
            });

            if (response.ok) {
                // Handle successful profile update (e.g., redirect, show success message)
                console.log('Changes saved to your profile!');
                alert('정보 수정이 성공적으로 완료되었습니다!');
                router.push('/auth/profile');
            } else {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    console.error('Profile update failed:', errorData);

                    switch (errorData.message) {
                        case '(은)는 이전 비밀번호와 동일합니다.':
                            alert('이전과 동일한 비밀번호입니다. 새로운 비밀번호를 입력해주세요.');
                            break;
                        case '(은)는 이전 전화번호와 동일합니다.':
                            alert('이전과 동일한 전화번호입니다. 새로운 번호를 입력해주세요.');
                            break;
                        case '(은)는 이전 이름과 동일합니다.':
                            alert('이전과 동일한 이름입니다. 변경된 이름을 입력해주세요.');
                            break;
                        case '이미 존재하는 전화번호입니다.':
                            alert('이미 등록된 전화번호입니다. 다른 번호를 사용해주세요.');
                            break;
                        default:
                            alert(`정보수정 실패: ${errorData.message || '알 수 없는 오류'}`);
                    }
                } else {
                    if (response.status === 403) {
                        alert('접근이 거부되었습니다. 다시 로그인해주세요.');
                    } else {
                        const errorText = await response.text();
                        console.error('Profile update failed with non-JSON response:', errorText);
                        alert(`정보수정 실패: 서버에서 알 수 없는 오류가 발생했습니다. (Status: ${response.status})`);
                    }
                }
            }
        } catch (error) {
            console.error('Error during updating profile:', error);
            alert('회원 정보수정 중 오류가 발생했습니다. 다시 시도해주세요.');
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
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="userPhone">전화번호:</label>
                        <input
                            type="tel"
                            id="userPhone"
                            name="userPhone"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            placeholder="예: 010-1234-5678"
                            pattern="[0-9]{3}-?[0-9]{4}-?[0-9]{4}"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="userPwd">비밀번호:</label>
                        <input
                            type="password"
                            id="userPwd"
                            name="userPwd"
                            value={userPwd}
                            onChange={(e) => setUserPwd(e.target.value)}
                            minLength="6" // 비밀번호 최소 길이
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
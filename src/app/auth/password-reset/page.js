"use client";
import React, { useState } from 'react';
import customerStyles from "../../../styles/admin/customer/Customer.module.css";

export default function PasswordResetRequest() {
    const [userName, setUserName] = useState("");
    const [userId, setUserId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        try {
            //const response = await fetch("http://localhost:8080/auth/password-reset", {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/password-reset`, {

                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: userName, userId: userId, phoneNumber: phoneNumber }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                setErrorMessage(errorData.message || "일치하는 회원정보가 없습니다. 입력값을 확인해주세요.");
                return;
            }

            const data = await response.json().catch(() => ({}));
            setSuccessMessage(data.message || "비밀번호 재설정 안내를 전송했습니다. 안내에 따라 진행해주세요.");
        } catch (error) {
            setErrorMessage("네트워크 오류 또는 서버에 연결할 수 없습니다.");
            // eslint-disable-next-line no-console
            console.error("Password reset request failed", error);
        }
    };

    return (
        <div className={customerStyles.contentCard + " " + customerStyles.contentCardCenter}>
            <form onSubmit={handleSubmit} className={customerStyles.centeredForm}>
                <h1 className={customerStyles.formTitle}>비밀번호 재설정</h1>

                <div className={customerStyles.inputGroup}>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="이름"
                        required
                        className={customerStyles.textInput}
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                </div>

                <div className={customerStyles.inputGroup}>
                    <input
                        type="text"
                        name="userId"
                        id="userId"
                        placeholder="아이디"
                        required
                        className={customerStyles.textInput}
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                </div>

                <div className={customerStyles.inputGroup}>
                    <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="전화번호 (숫자만)"
                        pattern="[0-9]{9,13}"
                        inputMode="numeric"
                        required
                        className={customerStyles.textInput}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>

                {errorMessage && (
                    <div className={customerStyles.errorMessage}>{errorMessage}</div>
                )}

                {successMessage && (
                    <div className={customerStyles.searchInfo}>{successMessage}</div>
                )}

                <button type="submit" className={customerStyles.primaryButton}>
                    본인 확인하기
                </button>

                <div className={customerStyles.formLinks}>
                    <a href="/auth/session" className={customerStyles.link}>로그인</a>
                    <span className={customerStyles.separator}>|</span>
                    <a href="/auth/users" className={customerStyles.link}>회원가입</a>
                    <span className={customerStyles.separator}>|</span>
                    <a href="/auth/id-retrieval" className={customerStyles.link}>아이디 찾기</a>
                </div>
            </form>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { UserContext } from './UserContext';

export function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // 페이지가 로드될 때 localStorage 등에서 사용자 정보를 가져오는 로직
  useEffect(() => {
    // 예시: localStorage에서 세션 정보를 읽어와서 userInfo를 설정
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  // setUserInfo를 외부에서 사용할 수 있도록 value에 추가
  const value = { userInfo, setUserInfo, userRole, setUserRole };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

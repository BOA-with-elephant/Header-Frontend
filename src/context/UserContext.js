"use client";
import { createContext } from "react";

// 사용자 정보를 위한 Context 생성
// 초기값은 null로 설정하여, 데이터가 아직 로드되지 않았음을 나태냄.
export const UserContext = createContext(null);
'use client'; // Next.js에서 클라이언트 측 렌더링을 사용한다는 표시. 서버가 아닌 사용자의 웹 브라우저에서 이 코드가 실행된다.

import { useState, useEffect } from 'react';
import styles from '@/styles/admin/menu/Menu.module.css'; // 스타일 적용
import AddMenuCategoryModal from './components/AddEditMenuCategoryModal'; // 메뉴카테고리를 추가하거나 수정할 때 사용하는 팝업창(모달) 컴포넌트
import AddEditMenuModal from './components/AddEditMenuModal'; // 메뉴(시술)를 추가하거나 수정할 때 사용하는 팝업창(모달) 컴포넌트
import MessageModal from '@/components/ui/MessageModal'; // 사용자에게 성공/실패/경고 메시지를 보여주는 공통 팝업창(모달) 컴포넌트
import { useMessageModal } from '@/hooks/useMessageModal';
// MessageModal을 제어하기 위한 커스텀 훅으로 showError, showSuccess, showConfirm, showWarning 등을 통해 메시지 모달을 쉽게 제어할 수 있음
import { MESSAGES } from '@/constants/messages';

// 이 컴포넌트가 '메뉴 관리' 기능을 담당
export default function MenuManagement() {
    // --- 1. 상태 관리 변수들 (컴포넌트가 기억해야 할 데이터) ---
    // React의 useState를 사용하여 데이터가 변경될 때마다 화면이 자동으로 업데이트되도록 한다.

    // '메뉴 카테고리' 목록을 저장하는 변수 (예: 컷, 펌, 염색 등)
    const [menuCategories, setMenuCategories] = useState([]);
    // 현재 사용자가 선택한 카테고리 정보를 저장하는 변수 (선택된 카테고리에 따라 시술 목록이 달라짐)
    const [selectedCategory, setSelectedCategory] = useState(null);
    // 현재 화면에 보여줄 '메뉴(시술)' 목록을 저장하는 변수
    const [menus, setMenus] = useState([]);
    // 모든 '메뉴(시술)' 목록을 저장하는 변수 (카테고리 필터링 없이 전체 데이터)
    const [allMenus, setAllMenus] = useState([]);

    // 데이터 로딩 중인지 여부를 나타내는 변수 (true면 로딩 중, false면 로딩 완료)
    const [loading, setLoading] = useState(true); // 처음 카테고리 로딩 시 사용
    const [menuLoading, setMenuLoading] = useState(false); // 메뉴 목록 로딩 시 사용
    // 데이터 로딩 중 오류가 발생했는지 여부와 오류 메시지를 저장하는 변수
    const [error, setError] = useState(null);

    // '카테고리 추가' 모달(팝업창)이 열려있는지 여부를 나타내는 변수
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

    // '카테고리 수정' 모달(팝업창) 관련 상태
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false); // 수정 모달 열림 여부
    const [editCategoryData, setEditCategoryData] = useState(null); // 수정할 카테고리 데이터를 저장

    // '메뉴(시술) 등록/수정' 모달(팝업창) 관련 상태
    const [showAddMenuModal, setShowAddMenuModal] = useState(false); // 메뉴 등록 모달 열림 여부
    const [showEditMenuModal, setShowEditMenuModal] = useState(false); // 메뉴 수정 모달 열림 여부
    const [editMenuData, setEditMenuData] = useState(null); // 수정할 메뉴 데이터를 저장

    const SHOP_CODE = 1; // TODO: 실제 샵 코드에 따라 동적으로 변경하기(추후 로그인한 사용자의 실제 샵 코드를 이곳에 적용해야 함)
    // --- 2. API 통신 기본 URL ---
    // 백엔드 서버와 통신할 때 사용할 기본 주소
    const API_BASE_URL = `http://localhost:8080/api/v1/myshop/${SHOP_CODE}`;

    // --- 3. 메시지 모달 헬퍼 함수들 ---
    // 공통 메시지 모달을 쉽게 제어하기 위해 커스텀 훅을 사용(import)
    // 아래 변수들은 각각 모달 열림 상태, 닫기 함수, 메시지 표시 함수(성공/실패/확인)를 의미
    const { modal: messageModal, closeModal: closeMessageModal, showError, showSuccess, showConfirm, showWarning } = useMessageModal();

    // --- 4. 데이터 조회 함수들 (백엔드에서 데이터 가져오기) ---

    // 컴포넌트가 처음 화면에 나타날 때 (딱 한 번) 카테고리 목록을 불러옴
    // `useEffect`는 React 컴포넌트가 렌더링 된 후에 어떤 작업을 수행할지 정의할 때 사용
    useEffect(() => {
        fetchMenuCategories(); // 카테고리 조회 함수 호출
    }, []); // 빈 배열([])은 이 함수가 컴포넌트가 처음 로딩될 때 한 번만 실행되도록 함.

    // 메뉴 카테고리 목록을 백엔드에서 조회하는 함수
    const fetchMenuCategories = async () => {
        try {
            setLoading(true); // 로딩 시작
            // API_BASE_URL에 카테고리 조회 경로를 추가하여 백엔드에 요청을 보냄
            // '/menu/category/active'로 '활성화된 카테고리만' 가져옴
            const res = await fetch(`${API_BASE_URL}/menu/category/active`);
            // 응답이 성공적이지 않으면(예: 404, 500 오류) 에러 발생
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json(); // 응답 데이터를 JSON 형식으로 변환
            setMenuCategories(data); // 가져온 카테고리 데이터를 상태 변수에 저장
            setSelectedCategory(null); // 새로운 카테고리를 가져왔으므로 선택된 카테고리는 초기화
            // 카테고리가 하나라도 있다면, 전체 메뉴도 함께 불러옴
            if (data.length > 0) await fetchAllMenus();
        } catch (err) {
            setError(err.message); // 오류 메시지 저장
            console.error('카테고리 조회 실패:', err); // 개발자 콘솔에 오류 출력
            showError('데이터 로딩 오류', MESSAGES.COMMON.PROCESS_ERROR + '\n' + err.message); // 사용자에게 오류 팝업 표시
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    // 모든 메뉴(시술) 목록을 백엔드에서 조회하는 함수
    const fetchAllMenus = async () => {
        try {
            setMenuLoading(true); // 메뉴 로딩 시작
            // API_BASE_URL에 전체 메뉴 조회 경로를 추가하여 백엔드에 요청을 보냄
            const res = await fetch(`${API_BASE_URL}/menu`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json(); // 응답 데이터를 JSON 형식으로 변환
            setAllMenus(data); // 가져온 전체 메뉴 데이터를 상태 변수에 저장

            // 만약 현재 선택된 카테고리가 없다면 (즉, 기본값인 '전체 시술' 보기를 하고 있다면),
            // 활성화된 메뉴만 걸러내어 'menus' 상태에 바로 설정
            if (!selectedCategory) {
                const activeMenus = data.filter(menu => menu.isActive !== false); // isActive가 false가 아닌 메뉴만 필터링
                setMenus(activeMenus); // 필터링된 메뉴를 화면에 표시할 메뉴 목록에 저장
            }

            return data; // 이 함수를 호출한 곳에서 사용하도록 데이터 반환
        } catch (err) {
            setError('메뉴 조회 중 오류 발생');
            console.error('전체 메뉴 조회 실패:', err);
            showError('메뉴 로딩 오류', MESSAGES.COMMON.PROCESS_ERROR + '\n' + err.message);
            throw err; // 오류를 다시 던져서 이 함수를 호출한 다른 곳에서도 오류를 감지하고 처리할 수 있도록 함
        } finally {
            setMenuLoading(false); // 메뉴 로딩 종료
        }
    };

    // --- 5. 데이터 새로고침 함수 (변경 사항 적용) ---

    // 카테고리나 메뉴 데이터가 변경(추가/수정/삭제)되었을 때 전체 데이터를 새로고침하는 통합 함수
    // 이 함수는 백엔드의 최신 데이터를 다시 가져와서 화면에 반영
    const refreshAllData = async () => {
        try {
            console.log('데이터 새로고침 시작...');

            // 1. 카테고리 목록 새로고침
            const categoryRes = await fetch(`${API_BASE_URL}/menu/category/active`);
            if (!categoryRes.ok) throw new Error(`카테고리 조회 실패: ${categoryRes.status}`);
            const categories = await categoryRes.json();
            setMenuCategories(categories); // 최신 카테고리 목록으로 업데이트

            // 2. 전체 메뉴 새로고침
            const menuRes = await fetch(`${API_BASE_URL}/menu`);
            if (!menuRes.ok) throw new Error(`메뉴 조회 실패: ${menuRes.status}`);
            const allMenuData = await menuRes.json();
            setAllMenus(allMenuData); // 최신 전체 메뉴 목록으로 업데이트

            // 3. 현재 선택된 카테고리 상태 확인 및 조정
            if (selectedCategory) { // 특정 카테고리가 선택되어 있었다면
                // 선택된 카테고리가 아직 존재하는지 확인
                const stillExists = categories.some(cat => cat.categoryCode === selectedCategory.categoryCode);

                if (stillExists) {
                    // 카테고리가 여전히 존재하면 해당 카테고리의 활성 메뉴만 다시 필터링하여 표시
                    const filtered = allMenuData.filter(menu =>
                        menu.categoryCode === selectedCategory.categoryCode &&
                        menu.isActive !== false
                    );
                    setMenus(filtered);
                } else {
                    // 선택된 카테고리가 (예: 삭제되어서) 더 이상 존재하지 않는다면
                    console.log('선택된 카테고리가 삭제되어 전체 메뉴로 변경');
                    setSelectedCategory(null); // 선택된 카테고리 초기화
                    const activeMenus = allMenuData.filter(menu => menu.isActive !== false);
                    setMenus(activeMenus); // 전체 활성화된 메뉴를 표시
                }
            } else {
                // '전체 시술' 모드일 때는 전체 메뉴 중 활성화된 메뉴만 표시
                const activeMenus = allMenuData.filter(menu => menu.isActive !== false);
                setMenus(activeMenus);
            }

            console.log('데이터 새로고침 완료');

        } catch (err) {
            console.error('데이터 새로고침 실패:', err);
            setError(MESSAGES.COMMON.PROCESS_ERROR);
            showError('새로고침 실패', MESSAGES.COMMON.PROCESS_ERROR + '\n' + err.message);
        }
    };

    // --- 6. 메뉴 필터링 및 카운트 함수들 ---

    // 특정 카테고리 코드로 메뉴를 필터링하여 화면에 보여줄 메뉴 목록을 업데이트하는 함수
    const fetchMenusByCategory = async (categoryCode) => {
        try {
            setMenuLoading(true); // 메뉴 로딩 시작
            if (categoryCode === null) {
                // categoryCode가 null이면 '전체 시술'을 의미합니다.
                const activeMenus = allMenus.filter(menu => menu.isActive !== false);
                setMenus(activeMenus); // 전체 메뉴 중 활성화된 메뉴만 표시
            } else {
                // 특정 카테고리 코드가 주어지면 해당 카테고리에서 활성화된 메뉴만 필터링하여 표시
                const filtered = allMenus.filter(menu =>
                    menu.categoryCode === categoryCode &&
                    menu.isActive !== false
                );
                setMenus(filtered); // 필터링된 메뉴를 화면에 표시할 메뉴 목록에 저장
            }
        } catch (err) {
            setError('카테고리별 메뉴 조회 실패');
            console.error(err);
            showError('조회 실패', MESSAGES.COMMON.PROCESS_ERROR);
        } finally {
            setMenuLoading(false); // 메뉴 로딩 종료
        }
    };

    // 카테고리를 선택했을 때 호출되는 함수
    const handleCategorySelect = (category) => {
        setSelectedCategory(category); // 선택된 카테고리 정보를 상태 변수에 저장
        fetchMenusByCategory(category ? category.categoryCode : null); // 해당 카테고리의 메뉴를 불러옴
    };

    // '전체 시술' 버튼을 클릭했을 때 호출되는 함수
    const handleAllMenusSelect = () => {
        setSelectedCategory(null); // 선택된 카테고리를 없애서 '전체' 상태로 변경
        const activeMenus = allMenus.filter(menu => menu.isActive !== false); // 전체 메뉴 중 활성화된 메뉴만 필터링
        setMenus(activeMenus); // 필터링된 메뉴를 화면에 표시
    };

    // 특정 카테고리의 활성화된 메뉴 개수를 반환하는 함수 (카테고리 옆에 표시되는 숫자)
    const getCurrentMenuCount = (category) => {
        if (!category) {
            // '전체 시술'일 경우 모든 활성화된 메뉴의 개수를 반환
            return allMenus.filter(menu => menu.isActive !== false).length;
        }
        // 특정 카테고리일 경우 해당 카테고리 내의 활성화된 메뉴만 세어서 반환
        return allMenus.filter(menu =>
            menu.categoryCode === category.categoryCode &&
            menu.isActive !== false
        ).length;
    };

    // --- 7. 데이터 포맷팅 함수들 (화면에 보기 좋게 데이터 가공) ---

    // 카테고리 코드를 받아서 해당 카테고리 이름을 반환하는 함수
    const getCategoryName = (categoryCode) => {
        const found = menuCategories.find(cat => cat.categoryCode === categoryCode); // 카테고리 목록에서 해당 코드와 일치하는 카테고리 찾기
        return found ? found.categoryName : '미분류'; // 찾으면 이름 반환, 없으면 '미분류' 반환
    };

    // 가격을 천 단위 구분 기호가 있는 문자열로 포맷팅하는 함수 (예: 10000 -> 10,000)
    const formatPrice = (price) => {
        if (price === null || price === undefined) return '0'; // 가격이 없으면 '0' 반환
        return price.toLocaleString(); // 숫자를 현재 지역 설정에 맞게 문자열로 변환 (천 단위 구분 기호 추가)
    };

    // 소요 시간을 분 단위에서 '시간 + 분' 형태로 포맷팅하는 함수 (예: 90 -> 1시간 30분)
    const formatEstTime = (minutes) => {
        if (!minutes) return '미설정'; // 시간이 없으면 '미설정' 반환
        const h = Math.floor(minutes / 60); // 시간 계산
        const m = minutes % 60; // 분 계산
        return h && m ? `${h}시간 ${m}분` : h ? `${h}시간` : `${m}분`; // 포맷에 맞춰 반환
    };

    // --- 8. 모달 제어 핸들러 함수들 (팝업창 열고 닫기, 성공 시 처리) ---

    // '카테고리 추가' 버튼 클릭 시 호출
    const handleAddCategoryClick = () => setShowAddCategoryModal(true); // 추가 모달 열기
    // '카테고리 추가' 모달 닫기 시 호출
    const handleCloseAddCategoryModal = () => setShowAddCategoryModal(false); // 추가 모달 닫기
    // '카테고리 추가' 성공 시 호출 (모달 내부에서 호출)
    const handleCategoryAddSuccess = async (newCategory) => {
        console.log('카테고리 추가 성공, 데이터 새로고침...');
        await refreshAllData(); // 전체 데이터 새로고침
        showSuccess('카테고리 추가 완료', MESSAGES.CATEGORY.CREATE_SUCCESS); // 성공 메시지 팝업
    };

    // '카테고리 수정' 버튼 클릭 시 호출
    const handleEditCategoryClick = (category) => {
        setEditCategoryData(category); // 수정할 카테고리 데이터 저장
        setShowEditCategoryModal(true); // 수정 모달 열기
    };
    // '카테고리 수정' 모달 닫기 시 호출
    const handleCloseEditCategoryModal = () => {
        setShowEditCategoryModal(false); // 수정 모달 닫기
        setEditCategoryData(null); // 수정 데이터 초기화
    };
    // '카테고리 수정/삭제' 성공 시 호출 (모달 내부에서 호출)
    const handleCategoryEditSuccess = async (updatedCategory) => {
        console.log('카테고리 수정/삭제 성공, 데이터 새로고침...');
        await refreshAllData(); // 전체 데이터 새로고침

        if (updatedCategory) { // 업데이트된 카테고리 데이터가 있으면 (수정 완료)
            showSuccess('카테고리 수정 완료', MESSAGES.CATEGORY.UPDATE_SUCCESS);
        } else { // 데이터가 없으면 (삭제 완료)
            showSuccess('카테고리 삭제 완료', MESSAGES.CATEGORY.DELETE_SUCCESS + '\n관련 시술들도 함께 삭제되었습니다.');
        }
    };

    // '메뉴(시술) 등록' 버튼 클릭 시 호출
    const handleAddMenuClick = () => setShowAddMenuModal(true); // 등록 모달 열기
    // '메뉴 등록' 모달 닫기 시 호출
    const handleCloseAddMenuModal = () => setShowAddMenuModal(false); // 등록 모달 닫기
    // '메뉴 등록' 성공 시 호출 (모달 내부에서 호출)
    const handleMenuAddSuccess = async (newMenu) => {
        try {
            console.log('메뉴 추가 성공, 메뉴 데이터 새로고침...');
            const updatedMenus = await fetchAllMenus(); // 전체 메뉴 목록을 새로고침

            // 현재 선택된 카테고리가 있다면 해당 카테고리의 메뉴만 다시 필터링하여 표시
            if (selectedCategory && updatedMenus) {
                const filtered = updatedMenus.filter(menu =>
                    menu.categoryCode === selectedCategory.categoryCode &&
                    menu.isActive !== false
                );
                setMenus(filtered);
            }

            showSuccess('시술 등록 완료', MESSAGES.MENU.CREATE_SUCCESS);
        } catch (err) {
            console.error('메뉴 추가 후 새로고침 실패:', err);
            showError('새로고침 실패', MESSAGES.COMMON.PROCESS_ERROR + '\n' + err.message);
        }
    };

    // '메뉴(시술) 수정' 버튼 클릭 시 호출
    const handleEditMenuClick = (menu) => {
        console.log('클릭된 메뉴:', menu); // 어떤 메뉴를 클릭했는지 개발자 콘솔에 표시
        setEditMenuData(menu); // 수정할 메뉴 데이터 저장
        setShowEditMenuModal(true); // 수정 모달 열기
    };
    // '메뉴 수정' 모달 닫기 시 호출
    const handleCloseEditMenuModal = () => {
        setShowEditMenuModal(false); // 수정 모달 닫기
        setEditMenuData(null); // 수정 데이터 초기화
    };
    // '메뉴 수정/삭제' 성공 시 호출 (모달 내부에서 호출)
    const handleMenuEditSuccess = async (updatedMenu) => {
        try {
            console.log('메뉴 수정/삭제 성공, 메뉴 데이터 새로고침...');
            const updatedMenus = await fetchAllMenus(); // 전체 메뉴 목록을 새로고침

            // 현재 선택된 카테고리가 있다면 해당 카테고리의 메뉴만 다시 필터링하여 표시
            if (selectedCategory && updatedMenus) {
                const filtered = updatedMenus.filter(menu =>
                    menu.categoryCode === selectedCategory.categoryCode &&
                    menu.isActive !== false
                );
                setMenus(filtered);
            }

            if (updatedMenu) { // 업데이트된 메뉴 데이터가 있으면 (수정 완료)
                showSuccess('시술 수정 완료', MESSAGES.MENU.UPDATE_SUCCESS);
            } else { // 데이터가 없으면 (삭제 완료)
                showSuccess('시술 삭제 완료', MESSAGES.MENU.DELETE_SUCCESS);
            }
        } catch (err) {
            console.error('메뉴 수정 후 새로고침 실패:', err);
            showError('새로고침 실패', MESSAGES.COMMON.PROCESS_ERROR + '\n' + err.message);
        }
    };

    // --- 9. 로딩 및 오류 화면 처리 ---
    // 데이터 로딩 중이거나 오류 발생 시 보여줄 화면입니다.

    if (loading) { // `loading` 상태가 true일 때 (카테고리 초기 로딩)
        return <div className={styles.menuManagement}><div className={styles.loading}>로딩 중...</div></div>;
    }

    if (error) { // `error` 상태에 오류 메시지가 있을 때 (초기 로딩 중 오류 발생)
        return (
            <div className={styles.menuManagement}>
                <div className={styles.error}>
                    <p>데이터 로딩 오류</p>
                    <p>{error}</p>
                    <button onClick={fetchMenuCategories}>다시 시도</button> {/* '다시 시도' 버튼 */}
                </div>
            </div>
        );
    }
    // =========================================================================================================
    // --- 10. 메인 화면 렌더링 (HTML 구조) ---
    // 모든 준비가 완료되면 실제 메뉴 관리 화면을 그림
    return (
        <div className={styles.menuManagement}>
            {/* 페이지의 가장 위에 있는 '시술 목록' 제목과 '시술 등록' 버튼 영역 */}
            <div className={styles.pageHeader}>
                <h1>시술 목록</h1>
                <button className={styles.addMenuBtn} onClick={handleAddMenuClick}>
                    시술 등록 {/* 이 버튼을 누르면 메뉴 등록 팝업 오픈 */}
                </button>
            </div>

            <div className={styles.menuContent}>
                {/* --- 왼쪽 사이드바: 카테고리 목록 영역 --- */}
                <div className={styles.categorySidebar}>
                    <div className={styles.categoryHeader}>
                        {/* '전체 시술' 버튼. 선택되면 활성화 스타일 적용 */}
                        <h3
                            className={`${styles.allMenus} ${selectedCategory === null ? styles.active : ''}`}
                            onClick={handleAllMenusSelect}
                        >
                            전체 시술
                        </h3>
                    </div>

                    <div className={styles.categoryContent}>
                        <div className={styles.categoryList}>
                            {/* 백엔드에서 가져온 각 카테고리를 반복하여 행으로 출력 */}
                            {menuCategories.map((cat) => (
                                <div
                                    key={cat.categoryCode} // 각 카테고리를 식별하는 고유 키
                                    // 현재 선택된 카테고리이면 'active' 스타일을 적용
                                    className={`${styles.categoryItem} ${selectedCategory?.categoryCode === cat.categoryCode ? styles.active : ''}`}
                                    onClick={() => handleCategorySelect(cat)} // 카테고리 클릭 시 해당 카테고리 메뉴를 불러옴
                                >
                                    {/* 카테고리 색상 표시 (DB에서 받은 색상) */}
                                    <div
                                        className={styles.categoryColor}
                                        style={{ backgroundColor: cat.menuColor || '#cbd5e0' }} // 색상이 없으면 회색으로 표시
                                    ></div>
                                    <span className={styles.categoryName}>{cat.categoryName}</span> {/* 카테고리 이름 */}
                                    <span className={styles.menuCount}>{getCurrentMenuCount(cat)}</span> {/* 해당 카테고리의 시술 개수 */}
                                    <button
                                        type="button"
                                        className={styles.editCategoryBtn}
                                        onClick={(e) => {
                                            e.stopPropagation(); // 버튼 클릭이 부모 요소(카테고리 선택)로 전파되지 않도록 제한
                                            handleEditCategoryClick(cat); // 카테고리 수정 버튼 클릭 시 수정 모달 오픈
                                        }}
                                    >
                                        수정
                                    </button>
                                </div>
                            ))}
                            {/* '그룹 추가' 버튼 */}
                            <div className={styles.addCategory} onClick={handleAddCategoryClick}>
                                <span>+ 그룹 추가 {/* 이 버튼을 클릭 시 카테고리 추가 팝업 오픈 */}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 오른쪽 메인 영역: 메뉴(시술) 목록 영역 --- */}
                <div className={styles.menuMain}>
                    <div className={styles.menuHeader}>
                        {/* 현재 선택된 카테고리 이름 또는 '전체 시술' 표시 */}
                        <h2>{selectedCategory?.categoryName || '전체 시술'}</h2>
                        {/* 현재 표시되는 시술의 총 개수 */}
                        <span className={styles.menuCountDisplay}>총 {menus.length}개</span>
                    </div>

                    {/* 메뉴 로딩 중일 때 표시되는 메시지 */}
                    {menuLoading ? (
                        <div className={styles.menuLoading}>메뉴를 불러오는 중...</div>
                    ) : (
                        // 메뉴 목록을 테이블 형태로 표시
                        <div className={styles.menuTable}>
                            <div className={styles.tableHeader}>
                                <div>NO.</div>
                                <div>그룹</div>
                                <div>시술명</div>
                                <div>소요시간</div>
                                <div>가격</div>
                            </div>
                            <div className={styles.tableBody}>
                                {menus.length === 0 ? ( // 표시할 메뉴가 없는 경우
                                    <div className={styles.noMenus}>
                                        <p>등록된 메뉴가 없습니다.</p>
                                    </div>
                                ) : (
                                    // `menus` 상태에 있는 각 메뉴를 반복하여 테이블 행으로 출력
                                    menus.map((menu, index) => (
                                        <div
                                            key={menu.menuCode} // 각 메뉴를 식별하는 고유 키
                                            className={styles.tableRow}
                                            onClick={() => handleEditMenuClick(menu)} // 메뉴 클릭 시 수정 모달 열기
                                        >
                                            <div className={styles.colNo}>{index + 1}</div> {/* 순번 */}
                                            <div className={styles.colGroup}>{getCategoryName(menu.categoryCode)}</div> {/* 메뉴의 카테고리 이름 */}
                                            <div className={styles.colName}>{menu.menuName}</div> {/* 시술명 */}
                                            <div className={styles.colEstTime}>{formatEstTime(menu.estTime)}</div> {/* 소요시간 (포맷팅 적용) */}
                                            <div className={styles.colPrice}>{formatPrice(menu.menuPrice)}</div> {/* 가격 (포맷팅 적용) */}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 모달(팝업창) 컴포넌트들 --- */}
            {/* 각 모달 컴포넌트는 `isOpen`으로 열림/닫힘을 제어하고, `onClose`로 닫는 함수를, `onSuccess`로 작업 성공 시 호출될 함수를 전달받는다. */}
            {/* `initialData`는 수정 모달에 기존 데이터를 채워줄 때 사용된다. */}
            {/* `categories`는 메뉴 등록/수정 모달에서 카테고리 선택 드롭다운을 채울 때 사용된다. */}

            {/* 메뉴 카테고리 등록/수정 모달 */}
            <AddMenuCategoryModal
                isOpen={showAddCategoryModal || showEditCategoryModal} // 등록 또는 수정 중 하나라도 true면 모달 열기
                onClose={() => {
                    setShowAddCategoryModal(false); // 등록 모달 닫기
                    setShowEditCategoryModal(false); // 수정 모달 닫기
                    setEditCategoryData(null); // 수정용 데이터 초기화
                }}
                onSuccess={showEditCategoryModal ? handleCategoryEditSuccess : handleCategoryAddSuccess}
                // 수정 모드이면 수정 성공 핸들러 호출, 아니면 등록 성공 핸들러 호출
                initialData={editCategoryData} // 수정 모드일 경우 모달에 전달할 초기 데이터 (등록 시에는 null)
            />

            {/* 메뉴 등록/수정 모달 */}
            <AddEditMenuModal
                isOpen={showAddMenuModal || showEditMenuModal} // 등록 또는 수정 중 하나라도 true면 모달 열기
                onClose={() => {
                    setShowAddMenuModal(false); // 등록 모달 닫기
                    setShowEditMenuModal(false); // 수정 모달 닫기
                    setEditMenuData(null); // 수정용 데이터 초기화
                }}
                onSuccess={showEditMenuModal ? handleMenuEditSuccess : handleMenuAddSuccess}
                // 수정 모드이면 수정 성공 핸들러 호출, 아니면 등록 성공 핸들러 호출
                initialData={editMenuData} // 수정 모드일 경우 모달에 전달할 초기 데이터 (등록 시에는 null)
                categories={menuCategories} // 카테고리 드롭다운을 채우기 위한 데이터 목록
            />

            {/* 메시지 모달 (성공/실패/경고/확인 등 안내용 공통 팝업) */}
            <MessageModal
                isOpen={messageModal.isOpen} // 모달 열림 여부 (true일 경우 표시됨)
                onClose={closeMessageModal} // 닫기 버튼 또는 바깥 클릭 시 호출되는 함수
                onConfirm={messageModal.onConfirm} // 확인(OK) 버튼 클릭 시 실행될 콜백 함수
                type={messageModal.type} // 모달 종류 ('success', 'error', 'warning', 'confirm' 등)
                title={messageModal.title} // 모달 제목
                message={messageModal.message} // 모달 본문 메시지
                showCancel={messageModal.showCancel} // 확인 외에 취소 버튼도 함께 표시할지 여부
            />

        </div>
    );
}
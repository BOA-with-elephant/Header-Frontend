'use client'; 
import { useState, useEffect } from "react";
// import MessageModal from '@/components/ui/MessageModal';  // 성공, 실패, 경고, 확인 등의 메시지를 사용자에게 표시하는 공통 모달 컴포넌트
// import { useMessageModal } from '@/hooks/useMessageModal'; // 메시지 모달 상태를 관리하고 제어하는 커스텀 훅
// showError, showSuccess, showConfirm, showWarning 등을 통해 상황별 메시지를 간편하게 호출 가능
// import { MESSAGES } from '@/constants/messages'; // 애플리케이션 전반에서 사용하는 표준 메시지 텍스트 모음 (예: 에러 메시지, 안내 문구 등)
import ReservationCalendar from "./components/ReservationCalendar";
import SearchResultList from "./components/SearchResultList";
import ReservationMenuModal from "./components/ReservationMenuModal";
import DetailReservationModal from "./components/DetailReservationModal";
import NewReservationModal from "./components/NewReservationModal";

export default function Reservation() {
    const [searchResultList, setSearchResultList] = useState([]);
    // 검색 결과
    const [isOpen, setIsOpen] = useState(false);
    // 메뉴 모달
    const [isShowModal, setIsShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState();
    const [isShowDetailReservation, setIsShowDetailReservation] = useState(false);
    const [selectedResvCode, setSelectedResvCode] = useState();
    const [isShowNewResvModal, setIsShowNewResvModal] = useState(false);
    const [resvDateList, setResvDateList] = useState([]);
    const [reservationInfo, setReservationInfo] = useState([]);

    const SHOP_CODE = 1;
    const API_BASE_URL = `http://localhost:8080/my-shops/${SHOP_CODE}/reservation`;
      

    const fetchReservationData = async() => {
        try{
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const formatMonth = String(month + 1).padStart(2, '0');
            const thisMonth = `${year}-${formatMonth}`;
            const response = await fetch(`${API_BASE_URL}?date=${thisMonth}`);
            const data = await response.json();
            console.log('data', data);
            setReservationInfo(data);

            const response2 = await fetch(`http://localhost:8080/shops/reservation/${SHOP_CODE}/available-schedule`);
            const data2 = await response2.json();
            setResvDateList(data2);
            console.log('예약 가능 시간', data2);
        } catch (error){
            console.error('예약 정보 불러오기 실패 :', error);
        }
    }

    useEffect(() => {
        fetchReservationData();
    }, []);

    return (
        <>
            <div className="content-card" style={{ height : 'max-content', position: 'relative'}}>
                    {isOpen && (
                        <SearchResultList 
                            searchResultList={searchResultList} 
                            setIsOpen={setIsOpen}
                            selectedDate={selectedDate}
                            setSelectedResvCode={setSelectedResvCode}
                            setIsShowDetailReservation={setIsShowDetailReservation}
                        />
                    )}
                    <ReservationCalendar
                        setSearchResultList={setSearchResultList}
                        setIsOpen={setIsOpen}
                        setIsShowModal={setIsShowModal}
                        setSelectedDate={setSelectedDate}
                        resvDateList={resvDateList}
                        setResvDateList={setResvDateList}
                        fetchReservationData={fetchReservationData}
                        reservationInfo={reservationInfo}
                        setReservationInfo={setReservationInfo}
                    />
                    {isShowModal && (
                        <ReservationMenuModal 
                            setIsShowModal={setIsShowModal}
                            selectedDate={selectedDate}
                            setSearchResultList={setSearchResultList}
                            setIsOpen={setIsOpen}
                            setIsShowNewResvModal={setIsShowNewResvModal}
                            resvDateList={resvDateList}
                        />
                    )}
                    {isShowDetailReservation && (
                        <DetailReservationModal
                            setIsShowDetailReservation={setIsShowDetailReservation}
                            selectedResvCode={selectedResvCode}
                        />
                    )}
                    {isShowNewResvModal && (
                        <NewReservationModal
                            isShowNewResvModal={isShowNewResvModal}
                            setIsShowNewResvModal={setIsShowNewResvModal}
                            selectedDate={selectedDate}
                            resvDateList={resvDateList}
                            fetchReservationData={fetchReservationData}
                        />
                    )}
            </div>
        </>
    )
}
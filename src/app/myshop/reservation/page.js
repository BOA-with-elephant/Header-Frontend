'use client'; 
import { useState, useEffect } from "react";
import MessageModal from '@/components/ui/MessageModal';  // 성공, 실패, 경고, 확인 등의 메시지를 사용자에게 표시하는 공통 모달 컴포넌트
import { useMessageModal } from '@/hooks/useMessageModal'; // 메시지 모달 상태를 관리하고 제어하는 커스텀 훅
// showError, showSuccess, showConfirm, showWarning 등을 통해 상황별 메시지를 간편하게 호출 가능
import { MESSAGES } from '@/constants/messages'; // 애플리케이션 전반에서 사용하는 표준 메시지 텍스트 모음 (예: 에러 메시지, 안내 문구 등)
import ReservationCalendar from "./components/ReservationCalendar";
import SearchResultList from "./components/SearchResultList";
import ReservationMenuModal from "./components/ReservationMenuModal";
import DetailReservationModal from "./components/DetailReservationModal";

export default function Reservation() {

    const [searchResultList, setSearchResultList] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isShowModal, setIsShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState();
    const [isShowDetailReservation, setIsShowDetailReservation] = useState(false);
    const [selectedResvCode, setSelectedResvCode] = useState();

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
                    />
                    {isShowModal && (
                        <ReservationMenuModal 
                            setIsShowModal={setIsShowModal}
                            selectedDate={selectedDate}
                            setSearchResultList={setSearchResultList}
                            setIsOpen={setIsOpen}
                        />
                    )}
                    {isShowDetailReservation && (
                        <DetailReservationModal
                            setIsShowDetailReservation={setIsShowDetailReservation}
                            selectedResvCode={selectedResvCode}
                        />
                    )}
            </div>
        </>
    )
}
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
import UpdateReservationInfoModal from "./components/UpdateReservaionInfoModal";
import NewReservationModal from "./components/NewReservationModal";
import DeleteAlertModal from "./components/DeleteAlertModal";
import RealDeleteAlertModal from "./components/RealDeleteAlertModal";
import ResultCustomMessageModal from "./components/ResultCustomMessageModal";

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
    const [isShowUpdateModal, setIsShowUpdateModal] = useState(false);
    const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
    const [isShowRealDeleteModal, setIsShowRealDeleteModal] = useState(false);
    const [isShowMessageModal, setIsShowMessageModal] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [resultTitle, setResultTitle] = useState('');
    const [resultType, setResultType] = useState('');
    // const [onMessageClose, setOnMessageClose] = useState(null);
    const [isCloseComplete, setIsCloseComplete] = useState(false);
    const [messageContext, setMessageContext] = useState('');
    

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

            const response2 = await fetch(`http://localhost:8080/api/v1/shops/reservation/${SHOP_CODE}/available-schedule`);
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

    useEffect(() => {
        if(isCloseComplete){
            setIsShowDetailReservation(true);
            setIsCloseComplete(false);
        }
    },[isCloseComplete]);

    return (
        <>
            <div className="content-card" style={{ height : 'max-content', position: 'relative'}}>
                    {/* 검색 결과창 */}
                    {isOpen && (
                        <SearchResultList 
                            searchResultList={searchResultList} 
                            setIsOpen={setIsOpen}
                            selectedDate={selectedDate}
                            setSelectedResvCode={setSelectedResvCode}
                            setIsShowDetailReservation={setIsShowDetailReservation}
                        />
                    )}
                    {/* 전체 조회 달력 */}
                    <ReservationCalendar
                        setSearchResultList={setSearchResultList}
                        setIsOpen={setIsOpen}
                        setIsShowModal={setIsShowModal}
                        setSelectedDate={setSelectedDate}
                        resvDateList={resvDateList}
                        setResvDateList={setResvDateList}
                        reservationInfo={reservationInfo}
                        setReservationInfo={setReservationInfo}
                    />
                    {/* 메뉴 모달 */}
                    {isShowModal && (
                        <ReservationMenuModal 
                            setIsShowModal={setIsShowModal}
                            selectedDate={selectedDate}
                            setSearchResultList={setSearchResultList}
                            setIsOpen={setIsOpen}
                            resvDateList={resvDateList}
                            selectedResvCode={selectedResvCode}
                            setIsShowNewResvModal={setIsShowNewResvModal}

                        />
                    )}
                    {/* 상세 조회 모달 */}
                    {isShowDetailReservation && (
                        <DetailReservationModal
                            setIsShowDetailReservation={setIsShowDetailReservation}
                            selectedResvCode={selectedResvCode}
                            setIsShowModal={setIsShowModal}
                            setIsShowUpdateModal={setIsShowUpdateModal}
                            setIsShowDeleteModal={setIsShowDeleteModal}
                            setIsShowRealDeleteModal={setIsShowRealDeleteModal}
                            selectedDate={selectedDate}
                        />
                    )}
                    {/* 예약 등록 모달 */}
                    {isShowNewResvModal && (
                        <NewReservationModal
                            isShowNewResvModal={isShowNewResvModal}
                            setIsShowNewResvModal={setIsShowNewResvModal}
                            selectedDate={selectedDate}
                            resvDateList={resvDateList}
                            fetchReservationData={fetchReservationData}
                            setIsShowMessageModal={setIsShowMessageModal}
                            setResultTitle={setResultTitle}
                            setResultMessage={setResultMessage}
                            setResultType={setResultType}
                            setIsCloseComplete={setIsCloseComplete}
                            setMessageContext={setMessageContext}
                        />
                    )}
                    {/* 예약 수정 모달 */}
                    {isShowUpdateModal && (
                        <UpdateReservationInfoModal
                            setIsShowUpdateModal={setIsShowUpdateModal}
                            selectedResvCode={selectedResvCode}
                            selectedDate={selectedDate}
                            resvDateList={resvDateList}
                            setIsShowDetailReservation={setIsShowDetailReservation}
                            fetchReservationData={fetchReservationData}
                            setIsShowMessageModal={setIsShowMessageModal}
                            setResultTitle={setResultTitle}
                            setResultMessage={setResultMessage}
                            setResultType={setResultType}
                            // setOnMessageClose={setOnMessageClose}
                            isCloseComplete={setIsCloseComplete}
                            setIsCloseComplete={setIsCloseComplete}
                            setMessageContext={setMessageContext}
                        />
                    )}
                    {/* 예약 삭제 알림 모달 */}
                    {isShowDeleteModal && (
                        <DeleteAlertModal
                            isShowDeleteModal={isShowDeleteModal}
                            setIsShowDeleteModal={setIsShowDeleteModal}
                            setIsShowModal={setIsShowModal}
                            selectedResvCode={selectedResvCode}
                            fetchReservationData={fetchReservationData}
                            
                        />
                    )}
                    {/* 예약 물리적 삭제 알림 모달 */}
                    {isShowRealDeleteModal && (
                        <RealDeleteAlertModal
                            isShowRealDeleteModal={isShowRealDeleteModal}
                            setIsShowRealDeleteModal={setIsShowRealDeleteModal}
                            setIsShowModal={setIsShowModal}
                            selectedResvCode={selectedResvCode}
                            fetchReservationData={fetchReservationData}
                        />
                    )}
                    {/* 성공 메시지 모달 */}
                    <ResultCustomMessageModal
                        isShowMessageModal={isShowMessageModal}
                        setIsShowMessageModal={setIsShowMessageModal}
                        resultMessage={resultMessage}
                        resultTitle={resultTitle}
                        resultType={resultType}
                        isCloseComplete={isCloseComplete}
                        setIsCloseComplete={setIsCloseComplete}
                        messageContext={messageContext}
                    />
                    {/*  */}
            </div>
        </>
    )
}
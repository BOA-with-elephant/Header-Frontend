'use client'; 
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/context/UserContext"; 
import ReservationCalendar from "./components/ReservationCalendar";
import SearchResultList from "./components/SearchResultList";
import ReservationMenuModal from "./components/ReservationMenuModal";
import DetailReservationModal from "./components/DetailReservationModal";
import UpdateReservationInfoModal from "./components/UpdateReservaionInfoModal";
import NewReservationModal from "./components/NewReservationModal";
import DeleteAlertModal from "./components/DeleteAlertModal";
import RealDeleteAlertModal from "./components/RealDeleteAlertModal";
import ResultCustomMessageModal from "./components/ResultCustomMessageModal";
import AddEditSalesModal from "../sales/components/AddEditSalesModal";

export default function Reservation() {
    const {userInfo} = useContext(UserContext); // Context에서 userInfo 가져오기
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
    const [isCloseComplete, setIsCloseComplete] = useState(false);
    const [messageContext, setMessageContext] = useState('');
    const [isPreventRegist, setIsPreventRegist] = useState(false);
    const [preventRegistDate, setPreventRegistDate] = useState();
    const [isOpenSalesModal, setIsOpenSalesModal] = useState(false);
    // const [onCloseSalesModal, setOnCloseSalesModal] = useState(false);
    const [detailReservation, setDetailReservation] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false); // 매출 모달 상태
    const [editingItem, setEditingItem] = useState(null);
    
    const SHOP_CODE = userInfo?.shopCode;
    const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${SHOP_CODE}/reservation`;

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

            const response2 = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/shops/reservation/${SHOP_CODE}/available-schedule`);
            const data2 = await response2.json();
            setResvDateList(data2);
            console.log('예약 가능 시간', data2);

        } catch (error){
            console.error('예약 정보 불러오기 실패 :', error);
        }
    }

    const fetchSearchResult = async() => {
        try{
            // const formattedResvDate = `${selectedDate.slice(0, 4)}-${selectedDate.slice(4, 6)}-${selectedDate.slice(6, 8)}`;
            const response3 = await fetch(`${API_BASE_URL}?resvDate=${selectedDate}`,{
                method : 'GET',
                headers : {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data3 = await response3.json();
            setSearchResultList(data3);
        }catch (error){
            console.error('예약 정보 불러오기 실패 :', error);
        };
    };


    useEffect(() => {
        fetchReservationData();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchSearchResult();
        }
    }, [selectedDate]);

    useEffect(() => {
        if(isCloseComplete){
            setIsShowDetailReservation(true);
            setIsCloseComplete(false);
        }
    },[isCloseComplete]);

    const handleModalClose = () => {
        setIsOpenSalesModal(false);
        setEditingItem(null);
    };

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
                        userInfo={userInfo}
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
                            isPreventRegist={isPreventRegist}
                            setIsPreventRegist={setIsPreventRegist}
                            preventRegistDate={preventRegistDate}
                            setPreventRegistDate={setPreventRegistDate}
                            userInfo={userInfo}
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
                            setIsOpenSalesModal={setIsOpenSalesModal}
                            setDetailReservation={setDetailReservation}
                            userInfo={userInfo}
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
                            userInfo={userInfo}
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
                            isCloseComplete={isCloseComplete}
                            setIsCloseComplete={setIsCloseComplete}
                            setMessageContext={setMessageContext}
                            userInfo={userInfo}
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
                            fetchSearchResult={fetchSearchResult}
                            userInfo={userInfo}
                            
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
                            fetchSearchResult={fetchSearchResult}
                            userInfo={userInfo}
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
                    {/* 매출 등록 */}
                    <AddEditSalesModal
                        detailReservation={detailReservation}
                        isOpen={isOpenSalesModal}
                        chosedDate={selectedDate}
                        setIsShowDetailReservation={setIsShowDetailReservation}
                        setIsOpen={setIsOpenSalesModal}
                        fetchSearchResult={fetchSearchResult}
                        onClose={handleModalClose}
                    />
            </div>
        </>
    )
}
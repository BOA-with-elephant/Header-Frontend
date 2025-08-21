'use client'; 
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/context/UserContext";
import CanceledAndNoShowList from "./component/CanceledAndNoShowList";
import OnlyNoShowList from "./component/OnlyNoShowList";
import DetailResvModal from "./component/DetailResvModal";
import HardDeleteAlertModal from "./component/HardDeleteAlertModal";
import ResultCustomMessageModal from "../reservation/components/ResultCustomMessageModal";

export default function NoShow(){
    const { userInfo } = useContext(UserContext)
    const [canceledAndNoShowList, setCanceledAndNoShowList] = useState([]);
    const [onlyNoShowList, setOnlyNoShowList] = useState([]);
    const [isShowDetailReservation, setIsShowDetailReservation] = useState(false);
    const [selectedResvCode, setSelectedResvCode] = useState();
    const [isShowRealDeleteModal, setIsShowRealDeleteModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isShowMessageModal, setIsShowMessageModal] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [resultTitle, setResultTitle] = useState('');
    const [resultType, setResultType] = useState('');
    const [messageContext, setMessageContext] = useState('');

    const SHOP_CODE = userInfo.shopCode;
    const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/my-shops/${SHOP_CODE}/reservation`;

    useEffect(() => {
        const canceledAndNoShow = async() => {
            try{
                const response = await fetch(`${API_BASE_URL}/canceledAndNoShow`,{
                    method : 'GET',
                    headers : {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        "Content-Type" : "application/json"
                    },
                });
                const data = await response.json();
                setCanceledAndNoShowList(data.results.result);
                console.log('❌❌ noShowList : ', data.results.result);
            }catch(error){
                console.error('예약 상세 정보 불러오기 실패 :', error);
            }
        };
        canceledAndNoShow();

        const onlyNoShow = async() => {
            try{
                const response = await fetch(`${API_BASE_URL}/onlyNoShow`,{
                    method : 'GET',
                    headers : {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        "Content-Type" : "application/json"
                    },
                });
                const data = await response.json();
                setOnlyNoShowList(data.results.result);
                console.log('❌😈 노쇼만 : ', data.results.result);
            } catch(error){
                console.error('노쇼 조회 실패 : ', error);
            }
        };
        onlyNoShow();
    }, [refreshKey])

    return(
        <>
            <div className="content-card" style={{ height : 'max-content', position: 'relative'}}>
                <CanceledAndNoShowList
                    canceledAndNoShowList={canceledAndNoShowList}
                    setIsShowDetailReservation={setIsShowDetailReservation}
                    setSelectedResvCode={setSelectedResvCode}
                />
            </div>
            <div className="content-card" style={{ height : 'max-content', position: 'relative'}}>
                <OnlyNoShowList
                    onlyNoShowList={onlyNoShowList}
                    setIsShowDetailReservation={setIsShowDetailReservation}
                    setSelectedResvCode={setSelectedResvCode}
                    onDeleteSuccess={() => setRefreshKey(prev => prev + 1)}
                    setIsShowMessageModal={setIsShowMessageModal}
                    setResultTitle={setResultTitle}
                    setResultMessage={setResultMessage}
                    setResultType={setResultType}
                    setMessageContext={setMessageContext}
                    userInfo={userInfo}
                />
            </div>
            {isShowDetailReservation && (
                <DetailResvModal
                    selectedResvCode={selectedResvCode}
                    setIsShowDetailReservation={setIsShowDetailReservation}
                    setIsShowRealDeleteModal={setIsShowRealDeleteModal}
                    onlyNoShowList={onlyNoShowList}
                    onDeleteSuccess={() => setRefreshKey(prev => prev + 1)}
                    setIsShowMessageModal={setIsShowMessageModal}
                    setResultTitle={setResultTitle}
                    setResultMessage={setResultMessage}
                    setResultType={setResultType}
                    setMessageContext={setMessageContext}
                    userInfo={userInfo}
                />
            )}
            {isShowRealDeleteModal && (
                <HardDeleteAlertModal
                    isShowRealDeleteModal={isShowRealDeleteModal}
                    setIsShowRealDeleteModal={setIsShowRealDeleteModal}
                    selectedResvCode={selectedResvCode}
                    onDeleteSuccess={() => setRefreshKey(prev => prev + 1)}
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
                messageContext={messageContext}
            />
        </>
    )
}
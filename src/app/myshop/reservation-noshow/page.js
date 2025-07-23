'use client'; 
import { useState, useEffect } from "react";
import CanceledAndNoShowList from "./component/CanceledAndNoShowList";
import OnlyNoShowList from "./component/OnlyNoShowList";
import DetailResvModal from "./component/DetailResvModal";
import HardDeleteAlertModal from "./component/HardDeleteAlertModal";
import ResultCustomMessageModal from "../reservation/components/ResultCustomMessageModal";
// import MessageModal from '@/components/ui/MessageModal';  // 성공, 실패, 경고, 확인 등의 메시지를 사용자에게 표시하는 공통 모달 컴포넌트
// import { useMessageModal } from '@/hooks/useMessageModal'; // 메시지 모달 상태를 관리하고 제어하는 커스텀 훅
// showError, showSuccess, showConfirm, showWarning 등을 통해 상황별 메시지를 간편하게 호출 가능
// import { MESSAGES } from '@/constants/messages'; // 애플리케이션 전반에서 사용하는 표준 메시지 텍스트 모음 (예: 에러 메시지, 안내 문구 등)

export default function NoShow(){
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

    const SHOP_CODE = 1;
    const API_BASE_URL = `http://localhost:8080/my-shops/${SHOP_CODE}/reservation`;

    useEffect(() => {
        const canceledAndNoShow = async() => {
            try{
                const response = await fetch(`${API_BASE_URL}/canceledAndNoShow`);
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
                const response = await fetch(`${API_BASE_URL}/onlyNoShow`);
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
                />
            )}
            {isShowRealDeleteModal && (
                <HardDeleteAlertModal
                    isShowRealDeleteModal={isShowRealDeleteModal}
                    setIsShowRealDeleteModal={setIsShowRealDeleteModal}
                    selectedResvCode={selectedResvCode}
                    onDeleteSuccess={() => setRefreshKey(prev => prev + 1)}
                />
            )}
            {/* 성공 메시지 모달 */}
            <ResultCustomMessageModal
                isShowMessageModal={isShowMessageModal}
                setIsShowMessageModal={setIsShowMessageModal}
                resultMessage={resultMessage}
                resultTitle={resultTitle}
                resultType={resultType}
                // isCloseComplete={isCloseComplete}
                // setIsCloseComplete={setIsCloseComplete}
                messageContext={messageContext}
            />
        </>
    )
}